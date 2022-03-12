// Lib
import { v4 as uuidV4 } from "uuid";
import { StreamManager } from "src/libs/redis/streamManager";

// Util
import { sleep } from "src/utils/sleep";
import exp from "constants";

const streamManager = new StreamManager(1, 3, 3);
beforeAll(async () => {
  streamManager.connect();
});

afterAll(async () => {
  streamManager.disconnect();
});

describe("test storeStreams", () => {
  it("should store 1 stream request when requesting same stream with same session", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const streamId = uuidV4();
    const sessionId = uuidV4();

    // Action
    await streamManager.storeStream(userId, streamId, sessionId);

    // Assert
    const result1 = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );
    expect(result1[0].value).toEqual(`stream:${streamId}_session:${sessionId}`);
    expect(result1.length).toEqual(1);

    // Action
    await streamManager.storeStream(userId, streamId, sessionId);

    // Assert
    const result2 = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );
    const { score: timestamp1 } = result1[0];
    const { score: timestamp2 } = result2[0];
    expect(result2.length).toEqual(1);
    expect(timestamp2).toBeGreaterThan(timestamp1);
  });

  it("should store 2 records when requesting a stream with 2 sessionId", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();
    const streamId = "bar";
    const session1 = uuidV4();
    const session2 = uuidV4();

    // Action
    await streamManager.storeStream(userId, streamId, session1);
    await streamManager.storeStream(userId, streamId, session2);

    // Assert
    const record = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );
    expect(record.length).toBe(2);
  });

  it("should store 2 records when requesting 2 streams", async () => {
    expect.hasAssertions();
    // Arrange
    const userId = uuidV4();
    const stream1 = "bar";
    const stream2 = "foo";
    const sessionId = uuidV4();

    // Action
    await streamManager.storeStream(userId, stream1, sessionId);
    await streamManager.storeStream(userId, stream2, sessionId);

    // Assert
    const record = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );
    expect(record.length).toBe(2);
  });
});

describe("test getActiveStreams", () => {
  it("should return active streams with in heartbeat interval", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const sessionId = uuidV4();

    // Action
    await streamManager.redisClient.zAdd(userId, [
      { score: Date.now(), value: "foo" },
      { score: Date.now(), value: "bar" },
    ]);

    let activeStream = await streamManager.getActiveStreams(userId);

    // Assert
    expect(activeStream.length).toBe(2);

    // Action
    // Heartbeat interval is set to 3 seconds in test
    // Sleep and not sendng heartbeat for 3 seconds
    await sleep(3);
    activeStream = await streamManager.getActiveStreams(userId);
    expect(activeStream.length).toBe(0);
  });
});

describe("test getStreamStatus", () => {
  it("should return stream status", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const stream1 = uuidV4();
    const stream2 = uuidV4();
    const sessionId = uuidV4();
    await streamManager.redisClient.zAdd(userId, [
      { score: Date.now(), value: `stream:${stream1}_session:${sessionId}` },
    ]);
    const streams = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );

    // Action
    const status1 = await streamManager.getStreamStatus(
      userId,
      stream1,
      sessionId,
      streams
    );
    const status2 = await streamManager.getStreamStatus(
      userId,
      stream2,
      sessionId,
      streams
    );

    // Assert
    expect(status1.playing).toBe(true);
    expect(status2.playing).toBe(false);
  });
});

describe("test removeExceededStream", () => {
  it("should remove a stream when active streams are more than 3", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    await streamManager.redisClient.zAdd(userId, [
      { score: Date.now(), value: "foo" },
      { score: Date.now(), value: "bar" },
      { score: Date.now(), value: "foofoo" },
      { score: Date.now(), value: "barbar" },
    ]);

    let streams = await streamManager.redisClient.zRangeWithScores(
      userId,
      0,
      -1
    );
    expect(streams.length).toEqual(4);

    // Action
    await streamManager.removeExceededStream(userId, 4);
    streams = await streamManager.redisClient.zRangeWithScores(userId, 0, -1);
    expect(streams.length).toEqual(3);
  });
});
