import { redisClient } from "src/libs/redis/client";

export const getActiveStreams = async (
  userId: string,
  timeInSeconds: number
) => {
  const streams = await redisClient.zRangeWithScores(userId, 0, Date.now());
  const activeStreams = streams.filter(
    (s) => s.score > Date.now() - timeInSeconds * 1000
  );
  return activeStreams;
};
