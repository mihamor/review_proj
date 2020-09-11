import express from "express";
import morgan from 'morgan';

import config from './config';
import { generateTasks } from './cronTasks';

const app = express();

console.log(config);

app.use(morgan('combined'));


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const chunk = (array: any[], chunkSize: number) => (
  Array(Math.ceil(array.length / chunkSize)).fill(0).map((_, i) => (
    array.slice(i * chunkSize, i * chunkSize + chunkSize)
  ))
);

const runTasks = async () => {
  const tasks = await generateTasks(5);
  tasks.forEach((task) => task.start());
}

runTasks();

app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from service!',
  });
});

  
app.listen(config.servicePort, () => {
  console.log(`Service listening at http://localhost:${config.servicePort}`)
});