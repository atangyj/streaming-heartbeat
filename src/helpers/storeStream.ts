import { redisClient } from "src/libs/redis/client";

export const storeStream = async (
  userId: string,
  streamId: string,
  sessionId: string
): Promise<void> => {
  await redisClient.zAdd(userId, [
    { score: Date.now(), value: `${streamId}_${sessionId}` },
  ]);
};
