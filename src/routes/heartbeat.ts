// Lib
import { Context } from "koa";
import "dotenv/config";
import Router from "koa-router";
import { streamManager } from "src/libs/streamManager";

// Type
import { StreamQuery } from "types/stream";

const router = new Router();

router.post("/heartbeat", async (ctx: Context): Promise<void> => {
  const { userId, streamId, sessionId } = ctx.request.body as StreamQuery;

  // Validate queries
  if (!userId || !streamId || !sessionId) {
    const errorMessage = `${
      (!userId && "userId") ||
      (!streamId && "streamId") ||
      (!sessionId && "sessionId")
    } is missing`;

    ctx.throw(400, errorMessage);
  }

  const activeStreams = await streamManager.getActiveStreams(userId);
  const streamStatus = streamManager.getStreamStatus(
    streamId,
    sessionId,
    activeStreams
  );

  const canContinuePlay =
    activeStreams.length < streamManager.concurrencyLimit ||
    (activeStreams.length === streamManager.concurrencyLimit &&
      streamStatus.playing);

  if (canContinuePlay) {
    // Under concurrency limit, can continue play
    await streamManager.storeStream(userId, streamId, sessionId);

    // Clear stream records older than 1 week
    // No need to wait for clearing records completes
    streamManager.clearOldStreams(userId);

    ctx.status = 200;
  } else {
    // Reach concurrency limit
    // Handle scenario that mulitple servers write into redis, resulting in more than 3 active streams
    await streamManager.removeExceededStream(userId, activeStreams.length);
    ctx.throw(
      400,
      `user ${userId} has reached concurrency limit ${streamManager.concurrencyLimit}`
    );
  }
});

export { router };
