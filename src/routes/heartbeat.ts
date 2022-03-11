// Lib
import "dotenv/config";
import Router from "koa-router";

// Helper
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";
import { removeExceededStreams } from "src/helpers/removeExceededStreams";

interface Query {
  userId: string;
  streamId: string;
}

const router = new Router();
const timeout = process.env.TIMEOUT;
const concurrencyLimit = process.env.CONCURRENCY_LIMIT;

router.get("/heartbeat", async (ctx) => {
  const { userId, streamId } = ctx.query as unknown as Query;

  const activeStreams = await getActiveStreams(userId, timeout * 1000);

  if (activeStreams.length < concurrencyLimit) {
    // Allow stream request
    await storeStream(userId, streamId);
    console.log("stream requested");
    ctx.status = 200;
  } else {
    await removeExceededStreams(userId);
    console.log("stream request exceeded");
    ctx.status = 404;
  }
});

export { router };
