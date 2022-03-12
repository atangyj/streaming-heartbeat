// Lib
import supertest from "supertest";
import { v4 as uuidV4 } from "uuid";

// Service
import { server } from "src/index";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

// many people use same account for different streams
// u1 s1 s1
// u1 s2 s1
// u1 s3 s1
// u1 s4 s1

// many people use same account for same stream
// u1 s1 s1
// u1 s1 s2
// u1 s1 s3
// u1 s1 s4

const request = supertest(server);

describe("test heartbeat route", () => {
  it("should return 200 if a user succesfully requests a stream", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();

    // Action
    const resp = await request.get(
      `/heartbeat?userId=${userId}&streamId=foo&sessionId=bar`
    );

    // Assert
    expect(resp.status).toBe(200);
  });

  it("should return 400 if a user requests more than 3 streams", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const sessionId = uuidV4();

    // Action
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    const resp = await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    //const activeStreams = await getActiveStreams(userId, 3);
    // Assert
    expect(resp.status).toBe(400);
    //expect(activeStreams.length).toBe(3);
  });

  it("should return 200 if a user requests active stream", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const streamId = uuidV4();
    const sessionId = uuidV4();

    // Action
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${streamId}&sessionId=${sessionId}`
    );
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}&sessionId=${sessionId}`
    );
    const resp = await request.get(
      `/heartbeat?userId=${userId}&streamId=${streamId}&sessionId=${sessionId}`
    );

    const activeStreams = await getActiveStreams(userId, 3);
    // Assert
    expect(resp.status).toBe(200);
  });
});
