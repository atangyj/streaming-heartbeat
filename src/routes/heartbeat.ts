// Lib
import { Context } from "koa";
import "dotenv/config";
import Router from "koa-router";
import { redisClient } from "src/libs/redis/streamManager";

// Type
import { StreamQuery } from "types/stream";

const router = new Router();

router.post("/heartbeat", async (ctx: Context): Promise<void> => {
  const { userId, streamId, sessionId } = ctx.request.body as StreamQuery;

  // Validate queries
  if (!userId || !streamId || !sessionId) {
    const message = {
      userId: userId || "missing",
      streamId: streamId || "missing",
      sessionId: sessionId || "missing",
    };

    ctx.throw(400, JSON.stringify(message));
  }

  const activeStreams = await redisClient.getActiveStreams(userId);
  const streamStatus = await redisClient.getStreamStatus(
    userId,
    streamId,
    sessionId,
    activeStreams
  );

  const canContinuePlay =
    activeStreams.length < redisClient.concurrencyLimit ||
    (activeStreams.length === redisClient.concurrencyLimit &&
      streamStatus.playing);

  if (canContinuePlay) {
    // Under concurrency limit, can continue play
    await redisClient.storeStream(userId, streamId, sessionId);
    ctx.status = 200;
  } else {
    // Reach concurrency limit
    // Handle scenario that mulitple servers write into redis, resulting in more than 3 active streams
    await redisClient.removeExceededStream(userId, activeStreams.length);
    ctx.throw(400, `reach concurrency limit ${redisClient.concurrencyLimit}`);
  }
});

export { router };
