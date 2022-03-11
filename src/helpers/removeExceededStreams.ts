// Lib
import "dotenv/config";
import { redisClient } from "src/libs/redis/client";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

const concurrencyLimit = process.env.CONCURRENCY_LIMIT;
const timeout = process.env.TIMEOUT;

export const removeExceededStreams = async (userId: string): Promise<void> => {
  const activeStreams = await getActiveStreams(userId, timeout);

  if (activeStreams.length > concurrencyLimit) {
    await redisClient.zPopMax(userId);
  }
};