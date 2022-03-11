// Lib
import Router from "koa-router";
import { redisClient } from "src/libs/redis/client";

// Helper
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";
import { removeExceededStreams } from "src/helpers/removeExceededStreams";

interface Query {
  userId: string;
  streamId: string;
}

const router = new Router();
router.get("/heartbeat", async (ctx) => {
  const { userId, streamId } = ctx.query as unknown as Query;

  const activeStreams = await getActiveStreams(userId, 20 * 1000);

  if (activeStreams.length < 3) {
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
