import knex from 'knex';
import cron from 'node-cron';
import fetch from 'node-fetch';

import config from './config';
import {
  NormalizedReview,
  GoogleReviewResponse,
  Review,
  ReviewReply,
  Reviewer,
} from './types';


const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const recursiveFetchReviews = async (
  locationId: number,
  reviews: Review[] = [],
  page: number = 1,
): Promise<Review[]> => {
    let accReviews = reviews;
    try {
      const reviewsData = await fetch(
        `${config.googleApiUrl}/reviews?locationId=${locationId}&page=${page}`
      );
      const reviewsJson: GoogleReviewResponse = await reviewsData.json();

      const { nextPage, results } = reviewsJson;
      if (!results.length) return accReviews;

      const promiseResults = await Promise.all(
        results.map(async (review: Review) => {
          const foundedReview = await pg('Reviews').select('*').where({ id: review.id });
          return foundedReview[0];
        })
      );

      const reviewsToAdd = results.filter((_v, index) => !promiseResults[index]);
      const someAlreadyAdded = reviewsToAdd.length !== results.length;
      accReviews = [...accReviews, ...reviewsToAdd];

      if(!someAlreadyAdded && nextPage) {
        return recursiveFetchReviews(locationId, accReviews, page + 1);
      }

    } catch(error) {
      console.error(`Some error occured during review fetch: ${error.message}`);
    }
    return accReviews;
}

type NormalizedReviewReferences = {
  replies: ReviewReply[],
  reviewers: Reviewer[],
  reviews: NormalizedReview[],
};

const normalizeReviews = (reviews: Review[]):
NormalizedReviewReferences => (
  reviews.reduce<NormalizedReviewReferences>((acc, review) => ({
    replies: [...acc.replies, {
      ...review.reviewReply,
      id: Number(review.reviewReply.id),
    }],
    reviewers: [...acc.reviewers, {
      ...review.reviewer,
      id: Number(review.reviewer.id),
    }],
    reviews: [...acc.reviews, {
      id: Number(review.id),
      locationId: Number(review.locationId),
      reviewer: Number(review.reviewer.id),
      reviewReply: Number(review.reviewReply.id),
      starRating: review.starRating,
      comment: review.comment,
      createTime: review.createTime,
      updateTime: review.updateTime,
    }],
  }), {
    replies: [],
    reviewers: [],
    reviews: [],
   })
);


export const generateTasks = async (numberToFire: number) => {
  console.log('Generating tasks...');
  const locationsJobsList = await pg('Locations_Jobs').select('*');
  return locationsJobsList.map((locationsJobs, index) => (
    cron.schedule(`${Math.floor(index / numberToFire)} * * * * *`, async () => {
      const { id, locationId } = locationsJobs;
      console.log(`Job id: ${id}: Watching location's(id${locationId})`);

      const reviewsToAdd = await recursiveFetchReviews(locationsJobs.locationId);
      console.log(`Job id: ${id}: Reviews to add: ${reviewsToAdd.length}`);

      if(reviewsToAdd.length) {

        const { replies, reviewers, reviews } = normalizeReviews(reviewsToAdd);
        const reviewersResults = await pg('Reviewers').insert(reviewers).returning('*');
        console.log(`Job id: ${id}: Succesfully added ${reviewersResults.length} reviewers`);
        const repliesResults = await pg('ReviewReplies').insert(replies).returning('*');
        console.log(`Job id: ${id}: Succesfully added ${repliesResults.length} reviewers`);
        const addedReviewsResults = await pg('Reviews').insert(reviews).returning('*');
        console.log(`Job id: ${id}: Succesfully added ${addedReviewsResults.length} reviews`);
      }
    }, { scheduled: false })
  ));
};
