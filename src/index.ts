// Lib
import Koa, { Context } from "koa";
import bodyParser from "koa-bodyparser";

/// Routes
import { router as play } from "./routes/play";
import { router as hearbeat } from "./routes/heartbeat";

const app = new Koa();
app.use(bodyParser());
app.use(play.routes()).use(play.allowedMethods());
app.use(hearbeat.routes()).use(hearbeat.allowedMethods());
app.listen("8080");
console.log("listening 8080");
