// Lib
import { Context } from "koa";
import "dotenv/config";
import Router from "koa-router";

// Helper
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";
import { removeExceededStreams } from "src/helpers/removeExceededStreams";
import { cleanOldRecords } from "src/helpers/cleanOldRecords";

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
  const activeStreams = await getActiveStreams(userId, timeout);

  if (activeStreams.length < concurrencyLimit) {
    // Allow stream request
    await storeStream(userId, streamId, sessionId);
    console.log(userId, streamId, sessionId);
    console.log("stream requested");
    ctx.status = 200;
  } else if (activeStreams.length === concurrencyLimit) {
    const isRequestActiveStream = activeStreams.find((s) => {
      const ssid = `${streamId}_${sessionId}`;
      console.log(s.value, ssid);
      return s.value === `${streamId}_${sessionId}`;
    });
    if (isRequestActiveStream) {
      // Allow request active stream
      await storeStream(userId, streamId, sessionId);
      console.log("reach stream requested and request same stream");

      // Clean old records
      cleanOldRecords(userId);
      ctx.status = 200;
    } else {
      console.log("reach concurrency limit");
      ctx.status = 404;
    }
  } else {
    // Handle scenario that mulitple servers write into redis
    await removeExceededStreams(userId);
    console.log("remove exceeded stream");
    ctx.status = 404;
  }
});

export { router };
