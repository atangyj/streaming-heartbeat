// Lib
import { Context, HttpError, Next } from "koa";
import { createLogger, format, transports } from "winston";
import correlator from "correlation-id";

// Util
// import { getLogInfo } from "src/utils/logInfo";
const { combine, timestamp, prettyPrint } = format;

export const getReqInfo = (ctx: Context) => {
  const { hostname, ip, url, body: reqBody } = ctx.request;
  const log = {
    hostname,
    ip,
    url,
    reqBody,
  };
  return log;
};

export const correlationIdFormat = () => {
  return format((info) => {
    const correlationId = correlator.getId();
    if (correlationId) {
      info.correlationId = correlationId;
    }
    return info;
  })();
};

export const logger = createLogger({
  format: combine(timestamp(), correlationIdFormat(), prettyPrint()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "info.log", level: "info" }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
    const req = getReqInfo(ctx);
    const { message, status } = ctx.response;
    logger.info({ ...req, message, status });
  } catch (e) {
    if (e instanceof HttpError) {
      const { status, message } = e;
      const req = getReqInfo(ctx);
      logger.warn({ ...req, message, status });
      ctx.status = status;
      ctx.body = message;
    } else {
      const err = e as Error;
      const { message, stack } = err;
      const req = getReqInfo(ctx);
      logger.error({ ...req, message, status: 500, stack });
      ctx.status = 500;
    }
  }
};
