import { v4 as uuidv4 } from "uuid";
import { Context, Next } from "koa";
import correlator from "correlation-id";

export const correlationIdMiddleware = async (ctx: Context, next: Next) => {
  await correlator.withId(async () => {
    await next();
  });
};
