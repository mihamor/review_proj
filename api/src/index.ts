import express from "express";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

import config from './config';

const app = express();

console.log(config);

app.use(morgan('combined'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from api!',
  });
});

app.post('/watch-account', async (req, res) => {
  const { accountId } = req.body;

  try {
    const response = await fetch(`${config.serviceUrl}/watch-account`, {
      method: 'POST',
      headers: {
        ...(config.reviewsSecret ? { 'reviews-secret': config.reviewsSecret } : {}),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    });
    const responseJson = await response.json();

    res.json(responseJson);
  } catch(error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

  
app.listen(config.apiPort, () => {
  console.log(`API listening at http://localhost:${config.apiPort}`)
});