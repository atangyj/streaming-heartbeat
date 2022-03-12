import { redisClient } from "src/libs/redis/client";
import { logger } from "src/utils/logger";

export const cleanOldRecords = async (userId: string) => {
  try {
    const timeout = 7 * 24 * 60 * 60 * 1000;
    await redisClient.ZREMRANGEBYSCORE(userId, 0, Date.now() - timeout);
    logger.info("clean old records");
  } catch {
    logger.error("failed to clean old records");
  }
};
