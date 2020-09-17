import express from "express";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import knex from 'knex';
import fetch from 'node-fetch';

import config from './config';
import { generateTasks, recursiveFetchLocations } from './cronTasks';

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