import { streamManager } from "src/libs/streamManager";
import { server } from "src/index";

afterAll(async () => {
  streamManager.disconnect();
  server.close();
});
