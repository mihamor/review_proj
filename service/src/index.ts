import express from "express";
import morgan from 'morgan';

import config from './config';

const app = express();

app.use(morgan('combined'));


app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from service!',
  });
});

  
app.listen(config.servicePort, () => {
  console.log(`Service listening at http://localhost:${config.servicePort}`)
});