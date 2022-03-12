// Lib
import { Context } from "koa";
import "dotenv/config";
import Router from "koa-router";

// Helper
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";
import { removeExceededStreams } from "src/helpers/removeExceededStreams";
import { cleanOldRecords } from "src/helpers/cleanOldRecords";

// Util
import { logger } from "src/utils/logger";

interface Query {
  userId: string;
  streamId: string;
  sessionId: string;
}

const router = new Router();
const timeout = Number(process.env.TIMEOUT);
const concurrencyLimit = Number(process.env.CONCURRENCY_LIMIT);

router.get("/heartbeat", async (ctx: Context) => {
  const { userId, streamId, sessionId } = ctx.query as unknown as Query;
  // Validate queries
  if (!userId || !streamId || !sessionId) {
    const message = {
      userId: userId || "missing",
      streamId: streamId || "missing",
      sessionId: sessionId || "missing",
    };

    ctx.throw(400, JSON.stringify(message));
  }

  const activeStreams = await getActiveStreams(userId, timeout);
  // Under concurrency limit, accept request
  if (activeStreams.length < concurrencyLimit) {
    await storeStream(userId, streamId, sessionId);
    logger.info("stream requested");
    ctx.status = 200;

    // Reach concurrency limit
  } else if (activeStreams.length === concurrencyLimit) {
    const isRequestActiveStream = activeStreams.find(
      (s) => s.value === `${streamId}_${sessionId}`
    );

    // Accept request for active stream
    if (isRequestActiveStream) {
      // Allow request active stream
      await storeStream(userId, streamId, sessionId);
      logger.info("stream requested");

      // Clean old records
      cleanOldRecords(userId);
      ctx.status = 200;
    } else {
      ctx.throw(400, `reach concurrency limit ${concurrencyLimit}`);
    }
  } else {
    // Handle scenario that mulitple servers write into redis
    await removeExceededStreams(userId);
    ctx.throw(400, `reach concurrency limit ${concurrencyLimit}`);
  }
});

export { router };
