import { streamManager } from "src/libs/redis/streamManager";
import { server } from "src/index";

afterAll(async () => {
  streamManager.disconnect();
  server.close();
});
