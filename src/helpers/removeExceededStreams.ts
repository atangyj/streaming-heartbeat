// Lib
import { redisClient } from "src/libs/redis/client";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

export const removeExceededStreams = async (userId: string): Promise<void> => {
  const concurrencyLimit = 3;
  const time = 20;
  const activeStreams = await getActiveStreams(userId, time);
  if (activeStreams.length > concurrencyLimit) {
    await redisClient.zPopMax(userId);
  }
};
