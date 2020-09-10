import express from "express";
import morgan from 'morgan';

import config from './config';
import { generateTasks } from './cronTasks';

const app = express();

console.log(config);

app.use(morgan('combined'));


const runTasks = async () => {
  const tasks = await generateTasks();
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