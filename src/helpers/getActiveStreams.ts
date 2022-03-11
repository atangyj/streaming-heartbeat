import { redisClient } from "src/libs/redis/client";

export const getActiveStreams = async (
  userId: string,
  timeInSeconds: number
) => {
  const timestamp = Date.now();
  const streams = await redisClient.zRangeWithScores(userId, 0, timestamp);
  const activeStreams = streams.filter(
    (s) => s.score > timestamp - timeInSeconds * 1000
  );

  return activeStreams;
};
