// Lib
import { Context, HttpError, Next } from "koa";
import winston from "winston";

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "info.log", level: "info" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  try {
    logger.info(`request url: ${ctx.URL}`);
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      logger.warn(e);
      ctx.status = e.status;
      ctx.body = { message: e.message };
    } else {
      const err = e as Error;
      logger.error(err.stack);
      ctx.throw(500);
    }
  }
};
