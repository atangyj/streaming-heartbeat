import { redisClient } from "src/libs/redis/client";

export const storeStream = async (
  userId: string,
  streamId: string
): Promise<void> => {
  const timestamp = Date.now();
  await redisClient.zAdd(userId, [
    { score: timestamp, value: `${streamId}_${timestamp}` },
  ]);
};
