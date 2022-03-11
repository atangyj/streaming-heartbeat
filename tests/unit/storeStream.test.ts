// Lib
import { redisClient } from "src/libs/redis/client";
import { v4 as uuidV4 } from "uuid";

// Function
import { storeStream } from "src/helpers/storeStream";

describe("test storeStreams function", () => {
  it("should store stream request with userId streamId and timestamp", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const streamId = "bar";
    const timestamp = Date.now();

    // Action
    await storeStream(userId, streamId);

    // Assert
    const record = await redisClient.zRangeWithScores(userId, 0, Date.now());
    expect(record).toStrictEqual([{ score: timestamp, value: streamId }]);
  });
});
