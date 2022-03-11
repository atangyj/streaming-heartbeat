import { removeExceededStreams } from "src/helpers/removeExceededStreams";
import { storeStream } from "src/helpers/storeStream";
import { getActiveStreams } from "src/helpers/getActiveStreams";

// Lib
import { v4 as uuidV4 } from "uuid";

describe("test removeExceededStreams function", () => {
  it("should remove exceeded stream", async () => {
    expect.hasAssertions();

    // Arrange
    const userId = uuidV4();

    // Action
    await storeStream(userId, uuidV4());
    await storeStream(userId, uuidV4());
    await storeStream(userId, uuidV4());
    await storeStream(userId, uuidV4());
    const activeS0 = await getActiveStreams(userId, 4);
    await removeExceededStreams(userId);
    const activeS1 = await getActiveStreams(userId, 3);

    // Assert
    expect(activeS0.length).toBe(4);
    expect(activeS1.length).toBe(3);
  });
});
