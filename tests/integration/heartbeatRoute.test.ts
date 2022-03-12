// Lib
import supertest from "supertest";
import { v4 as uuidV4 } from "uuid";

// Service
import { server } from "src/index";

const endpoint = "/heartbeat";
const request = supertest(server);

describe("test POST /heartbeat", () => {
  it("should return 200 if a user succesfully requests a stream", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();
    const streamId = uuidV4();
    const sessionId = uuidV4();

    // Action
    const resp = await request
      .post(endpoint)
      .send({ userId, streamId, sessionId });

    // Assert
    expect(resp.status).toBe(200);
  });

  // it("should return 400 when a user requests more than 3 streams", async () => {
  //   expect.hasAssertions();

  //   // Arrange
  //   const userId = uuidV4();
  //   const sessionId = uuidV4();

  //   // Action
  //   const resp1 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: uuidV4(), sessionId });
  //   const resp2 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: uuidV4(), sessionId });
  //   const resp3 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: uuidV4(), sessionId });
  //   const resp4 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: uuidV4(), sessionId });

  //   // Assert
  //   expect(resp1.status).toBe(200);
  //   expect(resp2.status).toBe(200);
  //   expect(resp3.status).toBe(200);
  //   expect(resp4.status).toBe(400);
  // });

  // it("should return 400 when a user requests stream with more than 3 sessions", async () => {
  //   expect.hasAssertions();

  //   // Arrange
  //   const userId = uuidV4();
  //   const streamId = uuidV4();

  //   // Action
  //   const resp1 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: streamId, sessionId: uuidV4() });
  //   const resp2 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: streamId, sessionId: uuidV4() });
  //   const resp3 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: streamId, sessionId: uuidV4() });

  //   const resp4 = await request
  //     .post(endpoint)
  //     .send({ userId, streamId: streamId, sessionId: uuidV4() });

  //   // Assert
  //   expect(resp1.status).toBe(200);
  //   expect(resp2.status).toBe(200);
  //   expect(resp3.status).toBe(200);
  //   expect(resp4.status).toBe(400);
  // });
});
