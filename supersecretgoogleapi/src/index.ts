import express from "express";
import knex from 'knex';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { attachPaginate } from "knex-paginate";

import config from './config';

attachPaginate();
const app = express();
const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const limiter = rateLimit({
  windowMs: 1000, // 1 seconds
  max: 10 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(morgan('combined'));


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from fake google api!',
  });
});

app.get('/locations', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const accountId = req.headers['account-id'];

  if(!accountId) {
    return res.status(400).json({
      error: 'No account id provided',
    });
  }

  const perPage = 5;
  const locations = await pg('Accounts_Locations').where({
    accountId: accountId,
  }).join('Locations', 'Accounts_Locations.locationId', '=', 'Locations.id')
  .select('id', 'createdAt', 'languageCode',
    'storeCode', 'locationName', 'primaryPhone', 'additionalPhones',
    'address', 'additionalCategories', 'websiteUrl', 'regularHours',
    'specialHours', 'serviceArea', 'locationKey', 'labels', 'adWordsLocationExtensions',
    'latlng', 'openInfo', 'locationState', 'attributes', 'metadata',
    'profile', 'relationshipData')
  .orderBy('createdAt', 'desc')
  .paginate({
    perPage,
    currentPage: page,
    isLengthAware: true,
  })

  const { lastPage } = locations.pagination;
  return res.json({
    ...(
      locations.data.length === perPage && lastPage !== page  ?
      { nextPage: `/locations?page=${page + 1}` } :
      {}
    ),
    results: locations.data,
  });
});

app.get('/reviews', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const locationId = req.query.locationId;

  if(!locationId) {
    return res.status(400).json({
      error: 'No location id provided',
    });
  }

  const perPage = 5;
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
  .paginate({
    perPage,
    currentPage: page,
    isLengthAware: true,
  });

  const reviews = reviewsNormalized.data.map((reviewNormalized) => ({
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

  const { lastPage } = reviewsNormalized.pagination;
  return res.json({
    ...(
      reviews.length === perPage && lastPage !== page ?
      { nextPage: `/reviews?page=${page + 1}&locationId=${locationId}` } :
      {}
    ),
    results: reviews,
  });
});

app.listen(config.servicePort, () => {
  console.log(`Google api listening at http://localhost:${config.servicePort}`)
});