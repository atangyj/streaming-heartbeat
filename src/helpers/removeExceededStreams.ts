// Lib
import "dotenv/config";
import { redisClient } from "src/libs/redis/client";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

// Util
import { logger } from "src/utils/logger";

const timeout = Number(process.env.TIMEOUT);

export const removeExceededStreams = async (userId: string): Promise<void> => {
  const activeStreams = await getActiveStreams(userId, timeout);

  await redisClient.zPopMax(userId);
  logger.info("remove exceeded request");
};
