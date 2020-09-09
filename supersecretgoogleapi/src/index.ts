import Koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import json from "koa-json";

import config from './config';

const app = new Koa();
const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.body = { msg: "Hello from google api service server!" };

  await next();
});

app.use(json());
app.use(logger());

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.servicePort, () => {
  console.log("Google api service started");
});
