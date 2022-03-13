// Lib
import "dotenv/config";
import Koa from "koa";
import koabody from "koa-body";

// Middleware
import { loggerMiddleware, logger } from "./middlewares/logger";
import { correlationIdMiddleware } from "./middlewares/correlationId";

/// Routes
import { router as hearbeat } from "./routes/heartbeat";

const PORT = Number(process.env.PORT);

export const app = new Koa();

// Set up server
app.use(correlationIdMiddleware);
app.use(loggerMiddleware);
app.use(koabody());
app.use(hearbeat.routes()).use(hearbeat.allowedMethods());

// Start host
const server = app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});

export { server };
