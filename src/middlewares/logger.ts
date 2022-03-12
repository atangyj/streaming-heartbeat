// Lib
import { Context, HttpError, Next } from "koa";

// Util
import { logger } from "src/utils/logger";
import { HTTPError } from "superagent";

export const loggerMiddle = async (ctx: Context, next: Next) => {
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
