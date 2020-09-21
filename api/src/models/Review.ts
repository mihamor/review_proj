import knex from 'knex';

import config from '../config';


const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

export default class Review {
  static async getList(locationId: number) {
    const reviewsNormalized = await pg('Reviews').where({
      locationId,
    })
    .join('Reviewers', 'Reviews.reviewer', '=', 'Reviewers.id')
    .join('ReviewReplies', 'Reviews.reviewReply', '=', 'ReviewReplies.id')
    .select('Reviews.id as id', 'locationId', 'reviewer', 'starRating',
      'Reviews.comment as comment', 'createTime',
      'Reviews.updateTime as updateTime', 'reviewReply',
      'profilePhotoUrl', 'displayName',
      'isAnonymous', 'ReviewReplies.comment as replyComment',
      'ReviewReplies.updateTime as replyUpdateTime')
    .orderBy('createTime', 'desc')

    const reviews = reviewsNormalized.map((reviewNormalized) => ({
      id: reviewNormalized.id,
      locationId: reviewNormalized.locationId,
      reviewer: {
        id: reviewNormalized.reviewer,
        displayName: reviewNormalized.displayName,
        profilePhotoUrl: reviewNormalized.profilePhotoUrl,
        isAnonymous: reviewNormalized.isAnonymous,
      },
      starRating: reviewNormalized.starRating,
      comment: reviewNormalized.comment,
      createTime: reviewNormalized.createTime,
      updateTime: reviewNormalized.updateTime,
      reviewReply: {
        id: reviewNormalized.reviewReply,
        comment: reviewNormalized.replyComment,
        updateTime: reviewNormalized.replyUpdateTime,
      },
    }));
    return reviews;
  }
};