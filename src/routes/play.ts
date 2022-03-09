import Router from "koa-router";
import { redisClient } from "../libs/redis/client";

const router = new Router();
router.get("/play", async (ctx) => {
  console.log("play");

  redisClient.set("key", "value");
  // get user id and video id and timestamp
  // const redisClient = createClient();
  // redisClient.on('connect', ()=> {console.log('connect')});
  // await redisClient.connect();

  // 200 - can play, no more than 2 active streams for this user
  // 400 - cannot play, already 3 active streams
});

export { router };
