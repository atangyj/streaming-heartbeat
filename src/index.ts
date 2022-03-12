// Lib
import "dotenv/config";
import Koa from "koa";
import koabody from "koa-body";
import { redisClient } from "src/libs/redis/streamManager";

// Middleware
import { loggerMiddleware, logger } from "./middlewares/logger";

/// Routes
import { router as hearbeat } from "./routes/heartbeat";

const RETENTION_DAY = Number(process.env.RETENTION_DAY);
const HEARTBEAT_INTERVAL_IN_SECOND = Number(
  process.env.HEARTBEAT_INTERVAL_IN_SECOND
);
const CONCURRENCY_LIMIT = Number(process.env.CONCURRENCY_LIMIT);
const PORT = Number(process.env.PORT);

export const app = new Koa();

// Set up server
app.use(loggerMiddleware);
app.use(koabody());
app.use(hearbeat.routes()).use(hearbeat.allowedMethods());

redisClient.connect();

// Start host
const server = app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});

export { server };
