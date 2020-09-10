import knex from 'knex';
import cron from 'node-cron';
import fetch from 'node-fetch';

import config from './config';
import { Review, GoogleReviewResponse } from './types';


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



export const generateTasks = async () => {
  const locationsJobsList = await pg('Locations_Jobs').select('*');
  return locationsJobsList.map((locationsJobs) => (
    cron.schedule('*/10 * * * * *', async () => {
      const { id, locationId } = locationsJobs;
      console.log(`Job id: ${id}: Watching location's(id${locationId})`);

      const reviewsToAdd = await recursiveFetchReviews(locationsJobs.locationId);
      console.log(`Job id: ${id}: Reviews to add: ${reviewsToAdd.length}`);

      if(reviewsToAdd.length) {
        const addedReviewsResults = await pg('Reviews').insert(reviewsToAdd).returning('*');
        console.log(`Job id: ${id}: Succesfully added ${addedReviewsResults.length} reviews`);
      }
    }, { scheduled: false })
  ));
};
