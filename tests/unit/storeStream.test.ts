// Lib
import { redisClient } from "src/libs/redis/client";
import { v4 as uuidV4 } from "uuid";

// Function
import { storeStream } from "src/helpers/storeStream";

describe("test call storeStreams", () => {
  it("should store 1 stream request for a user", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const streamId = "bar";
    const sessionId = uuidV4();
    const timestamp = Date.now();

    // Action
    await storeStream(userId, streamId, sessionId);

    // Assert
    const record = await redisClient.zRangeWithScores(userId, 0, Date.now());
    expect(record).toStrictEqual([
      { score: timestamp, value: `${streamId}_${sessionId}` },
    ]);
  });

  it("should store 2 stream requests with different sessions for a user", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();
    const streamId = "bar";
    const session1 = uuidV4();
    const session2 = uuidV4();

    // Action
    await storeStream(userId, streamId, session1);
    await storeStream(userId, streamId, session2);

    // Assert
    const record = await redisClient.zRangeWithScores(userId, 0, Date.now());
    expect(record.length).toBe(2);
  });

  it("should store 2 stream requests with different streams for a user", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();
    const stream1 = "bar";
    const stream2 = "foo";
    const sessionId = uuidV4();

    // Action
    await storeStream(userId, stream1, sessionId);
    await storeStream(userId, stream2, sessionId);

    // Assert
    const record = await redisClient.zRangeWithScores(userId, 0, Date.now());
    expect(record.length).toBe(2);
  });
});
