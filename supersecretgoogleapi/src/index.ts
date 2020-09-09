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

app.use(morgan('combined'))


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from fake google api!',
  });
})

app.get('/locations', async (req, res) => {
  const page = Number(req.query.page) || 0;
  const accountId = req.headers['account-id'];

  if(!accountId) {
    return res.status(400).json({
      error: 'No account id provided',
    })
  }

  const locations = await pg('Accounts_Locations').where({
    accountId: accountId
  }).join('Locations', `"Accounts_Locations"."locationId"`, '=', '"Locations".id').
  select('id', 'createdAt', 'regionCode', 'languageCode',
    'postalCode', 'sortingCode', 'administrativeArea', 'locality',
    'sublocality', 'addressLines', 'recipients', 'organization').paginate({
    perPage: 10,
    currentPage: page,
    isLengthAware: true,
  });

  return res.json({
    ...(
      locations.pagination.lastPage === page ?
      { nextPage: `/locations?page=${page + 1}` } :
      {}
    ),
    results: locations.data,
  });
})

app.get('/reviews', async (req, res) => {
  const page = Number(req.query.page) || 0;
  const locationId = req.query.locationId
  const accountId = req.headers['account-id'];

  if(!accountId) {
    return res.status(400).json({
      error: 'No account id provided',
    })
  }
  
  if(!locationId) {
    return res.status(400).json({
      error: 'No location id provided',
    })
  }

  const locations = await pg('Accounts_Locations').where({
    accountId: accountId
  }).join('Locations', `"Accounts_Locations"."locationId"`, '=', '"Locations".id').
  select('id', 'createdAt', 'regionCode', 'languageCode',
    'postalCode', 'sortingCode', 'administrativeArea', 'locality',
    'sublocality', 'addressLines', 'recipients', 'organization').paginate({
    perPage: 10,
    currentPage: page,
    isLengthAware: true,
  });

  return res.json({
    ...(
      locations.pagination.lastPage === page ?
      { nextPage: `/locations?page=${page + 1}` } :
      {}
    ),
    results: locations.data,
  });
})

app.listen(config.servicePort, () => {
  console.log(`Google api listening at http://localhost:${config.servicePort}`)
})