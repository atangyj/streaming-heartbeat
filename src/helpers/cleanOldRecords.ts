import { redisClient } from "src/libs/redis/client";
import { sleep } from "src/utils/sleep";

export const cleanOldRecords = async (userId: string) => {
  try {
    const timeout = 7 * 24 * 60 * 60 * 1000;
    await redisClient.ZREMRANGEBYSCORE(userId, 0, Date.now() - timeout);
    console.log("clean old records");
  } catch {
    console.log("failed to clean old records");
  }
};
