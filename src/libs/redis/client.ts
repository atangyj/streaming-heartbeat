import { createClient } from "redis";

const redisClient = createClient();
redisClient.on("connect", () => {
  console.log("connected");
});
(async () => {
  await redisClient.connect();
})();

export { redisClient };
