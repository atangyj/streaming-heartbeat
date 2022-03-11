// Lib
import "dotenv/config";
import { redisClient } from "src/libs/redis/client";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

const timeout = Number(process.env.TIMEOUT);

export const removeExceededStreams = async (userId: string): Promise<void> => {
  const activeStreams = await getActiveStreams(userId, timeout);

  await redisClient.zPopMax(userId);
  console.log("exceeded request remove");
};
