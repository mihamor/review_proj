import express from "express";
import knex from 'knex';
import morgan from 'morgan';
import { attachPaginate } from "knex-paginate";

import config from './config';

attachPaginate();
const app = express();
const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

app.use(morgan('combined'));


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from fake google api!',
  });
});

app.get('/locations', async (req, res) => {
  const page = Number(req.query.page) || 0;
  const accountId = req.headers['account-id'];

  if(!accountId) {
    return res.status(400).json({
      error: 'No account id provided',
    });
  }

  const locations = await pg('Accounts_Locations').where({
    accountId: accountId,
  }).join('Locations', 'Accounts_Locations.locationId', '=', 'Locations.id').
  select('id', 'createdAt', 'languageCode',
    'storeCode', 'locationName', 'primaryPhone', 'additionalPhones',
    'address', 'additionalCategories', 'websiteUrl', 'regularHours',
    'specialHours', 'serviceArea', 'locationKey', 'labels', 'adWordsLocationExtensions',
    'latlng', 'openInfo', 'locationState', 'attributes', 'metadata',
    'profile', 'relationshipData').paginate({
    perPage: 5,
    currentPage: page,
    isLengthAware: true,
  });

  const { lastPage } = locations.pagination;
  return res.json({
    ...(
      lastPage !== page ?
      { nextPage: `/locations?page=${page + 1}` } :
      {}
    ),
    results: locations.data,
  });
});

app.get('/reviews', async (req, res) => {
  const page = Number(req.query.page) || 0;
  const locationId = req.query.locationId;

  if(!locationId) {
    return res.status(400).json({
      error: 'No location id provided',
    });
  }

  const reviews = await pg('Reviews').where({
    locationId,
  }).select('id', 'locationId', 'reviewer', 'starRating',
    'comment', 'createTime', 'updateTime', 'reviewReply').paginate({
    perPage: 5,
    currentPage: page,
    isLengthAware: true,
  });

  const { lastPage } = reviews.pagination;
  return res.json({
    ...(
      lastPage !== page ?
      { nextPage: `/reviews?page=${page + 1}&locationId=${locationId}` } :
      {}
    ),
    results: reviews.data,
  });
});

app.listen(config.servicePort, () => {
  console.log(`Google api listening at http://localhost:${config.servicePort}`)
});