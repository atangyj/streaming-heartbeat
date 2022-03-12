import { redisClient } from "src/libs/redis/streamManager";
import { server } from "src/index";

afterAll(async () => {
  redisClient.disconnect();
  server.close();
});
