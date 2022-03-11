// Lib
import { v4 as uuidV4 } from "uuid";

// Util
import { sleep } from "src/utils/sleep";

// Function
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";

describe("test storeStreams function", () => {
  it("should return active streams", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();
    const sessionId = uuidV4();

    // Action
    await storeStream(userId, "foo", sessionId);
    await storeStream(userId, "bar", sessionId);
    const sArr1 = await getActiveStreams(userId, 2);

    // Assert
    expect(sArr1.length).toBe(2);

    // Action
    await sleep(2);
    await storeStream(userId, "foobar", sessionId);
    const sArr2 = await getActiveStreams(userId, 2);
    expect(sArr2.length).toBe(1);
  });
});
