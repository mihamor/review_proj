import express from "express";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import * as http from 'http';

import { registerSocket } from './socketConnection';
import config from './config';
import { requestServiceAccountWatch } from "./helpers";

const app = express();
const server = http.createServer(app);
registerSocket(server);

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
    const response = await requestServiceAccountWatch(accountId);
    const responseJson = await response.json();
    res.json(responseJson);
  } catch(error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

  
server.listen(config.apiPort, () => {
  console.log(`API listening at http://localhost:${config.apiPort}`)
});