import express from "express";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import knex from 'knex';
import fetch from 'node-fetch';

import config from './config';
import { generateTasks, recursiveFetchLocations } from './cronTasks';
import { insertUpdate } from "./helpers";
import { TimePeriod } from "./types";

const app = express();

console.log(config);

app.use(morgan('combined'));
app.use(bodyParser.json());


const pg = knex({
  client: 'pg',
  connection: config.databaseUrl,
  searchPath: ['knex', 'public'],
});

const runTasks = async () => {
  const taskChunkSize = 5;
  const task = await generateTasks(taskChunkSize);
  task.start();
}

runTasks();

app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from service!',
  });
});

app.post('/unwatch-account', async (req, res) => {
  const { accountId: accountIdStr } = req.body;
  const accountId = Number(accountIdStr);
  if (!accountId) {
    return res.status(400).json({
      error: 'Invalid account id',
    });
  }

  const accountsLocationsResults = await pg('Accounts_Locations')
  .join('Locations_Jobs', 'Accounts_Locations.locationId', '=', 'Locations_Jobs.locationId')
  .where({ accountId })
  .select('id')
  .returning('*');

  const deleteJobsResults = await pg('Locations_Jobs')
  .delete(accountsLocationsResults)
  .returning('*');

  console.log(accountId);
  res.json(deleteJobsResults);
});

app.post('/watch-account', async (req, res) => {
  const reviewsSecret = req.headers['reviews-secret'];
  if(reviewsSecret !== config.reviewsSecret) {
    return res.status(400).json({
      error: 'Invalid secret',
    });
  }

  const { accountId: accountIdStr } = req.body;
  const accountId = Number(accountIdStr);
  if (!accountId) {
    return res.status(400).json({
      error: 'Invalid account id',
    });
  }

  try {
    const locations = await recursiveFetchLocations(accountId);
    const locationsJobs = locations.map((location) => ({
      locationId: location.id,
    }));
    if(!locationsJobs.length) {
      return res.json([]);
    }

    console.log(locations);
    const normalizedLocations = locations.map((location) => ({
      ...location,
      address: location.address.id,
      regularHours: location.regularHours.id,
      locationKey: location.locationKey.id,
    }));

    const accountsLocations = locations.map((location) => ({
      accountId,
      locationId: location.id,
    }));

    const businessHours = locations.map((location) => ({
      id: location.regularHours.id,
      createdAt: location.regularHours.createdAt,
    }));
    const timePeriods = locations.reduce<TimePeriod[]>((acc, location) => ([
      ...acc,
      ...location.regularHours.periods,
    ]), []);
    const locationKeys = locations.map((location) => location.locationKey);
    const postalAddresses = locations.map((location) => location.address);

    const businessHoursResults = await insertUpdate(pg, 'BusinessHours', businessHours);
    console.log(businessHoursResults);
    const timePeriodsResults = await insertUpdate(pg, 'TimePeriods', timePeriods);
    console.log(timePeriodsResults);
    const locationKeysResults = await insertUpdate(pg, 'LocationKey', locationKeys);
    console.log(locationKeysResults);
    const postalAddressesResults = await insertUpdate(pg, 'PostalAddress', postalAddresses);
    console.log(postalAddressesResults);

    const locationsResults = await insertUpdate(pg, 'Locations', normalizedLocations);
    console.log(locationsResults);
    const accountsLocationsResults = await pg('Accounts_Locations').insert(accountsLocations).returning('*');
    console.log(accountsLocationsResults);

    const locationsJobsResults = await pg('Locations_Jobs').insert(locationsJobs).returning('*');
    res.json(locationsJobsResults);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }

});

  
app.listen(config.servicePort, () => {
  console.log(`Service listening at http://localhost:${config.servicePort}`)
});