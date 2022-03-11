// Lib
import "dotenv/config";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

/// Routes
import { router as hearbeat } from "./routes/heartbeat";

const app = new Koa();
app.use(bodyParser());
app.use(hearbeat.routes()).use(hearbeat.allowedMethods());

export const server = app.listen("8080");
console.log("listening 8080");
