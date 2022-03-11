// Lib
import supertest from "supertest";
import { v4 as uuidV4 } from "uuid";

// Service
import { server } from "src/index";

// Helper
import { getActiveStreams } from "src/helpers/getActiveStreams";

const request = supertest(server);

describe("test heartbeat route", () => {
  it("should return 200 if succesfully request a stream", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();

    // Action
    const resp = await request.get(`/heartbeat?userId=${userId}&streamId=456`);

    // Assert
    expect(resp.status).toBe(200);
  });

  it("should return 404 if try to request more than 3 streams", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();

    // Action
    await request.get(`/heartbeat?userId=${userId}&streamId=${uuidV4()}`);
    await request.get(`/heartbeat?userId=${userId}&streamId=${uuidV4()}`);
    await request.get(`/heartbeat?userId=${userId}&streamId=${uuidV4()}`);
    const resp = await request.get(
      `/heartbeat?userId=${userId}&streamId=${uuidV4()}`
    );
    const activeStreams = await getActiveStreams(userId, 3);
    // Assert
    expect(resp.status).toBe(404);
    expect(activeStreams.length).toBe(3);
  });
});
