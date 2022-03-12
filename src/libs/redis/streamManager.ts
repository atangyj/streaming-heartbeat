// Lib
import "dotenv/config";
import { createClient, RedisClientType } from "redis";

// Util
import { logger } from "src/middlewares/logger";

// Type
import { Stream, StreamMap } from "types/stream";

// Env
const RETENTION_DAY = Number(process.env.RETENTION_DAY);
const HEARTBEAT_INTERVAL_IN_SECOND = Number(
  process.env.HEARTBEAT_INTERVAL_IN_SECOND
);
const CONCURRENCY_LIMIT = Number(process.env.CONCURRENCY_LIMIT);

class StreamManager {
  redisClient: RedisClientType;
  retentionDay: number;
  heartbeatInterval: number;
  concurrencyLimit: number;

  constructor(
    retentionDay: number,
    heartbeatInterval: number,
    concurrencyLimit: number
  ) {
    this.redisClient = createClient();
    this.retentionDay = retentionDay;
    this.heartbeatInterval = heartbeatInterval;
    this.concurrencyLimit = concurrencyLimit;
  }

  connect() {
    this.redisClient.on("connect", () => {
      logger.info(`connected to redis`);
    });
    this.redisClient.connect();
  }

  disconnect() {
    this.redisClient.on("disconnect", () => {
      logger.info(`disconnected to redis`);
    });
    this.redisClient.disconnect();
  }

  public async storeStream(
    userId: string,
    streamId: string,
    sessionId: string
  ): Promise<void> {
    await this.redisClient.zAdd(userId, [
      { score: Date.now(), value: `stream:${streamId}_session:${sessionId}` },
    ]);
    logger.info(`allow user ${userId} to request stream ${streamId}`);
  }

  public async getActiveStreams(userId: string): Promise<Stream[]> {
    const timestamp = Date.now();
    const activeStreams = await this.redisClient.zRangeByScoreWithScores(
      userId,
      timestamp - this.heartbeatInterval * 1000,
      timestamp
    );

    return activeStreams;
  }

  public async getStreamStatus(
    userId: string,
    streamId: string,
    sessionId: string,
    activeStreams: Stream[]
  ): Promise<{ playing: boolean }> {
    const streamMap = activeStreams.reduce(
      (map: StreamMap, stream): StreamMap => {
        const { value: streamId, score: timestamp } = stream;
        map[streamId] = timestamp;
        return map;
      },
      {}
    );

    const playing = streamMap.hasOwnProperty(
      `stream:${streamId}_session:${sessionId}`
    );
    return { playing };
  }

  public async removeExceededStream(
    userId: string,
    activeStreamsCount: number
  ): Promise<void> {
    if (activeStreamsCount > 3) {
      await this.redisClient.zPopMax(userId);
      logger.info(`remove exceeded request of user ${userId}`);
    }
  }

  public async cleanOldStreams(userId: string): Promise<void> {
    // Failed to clean old stream records does not affect the api behaviour so catch the error instead of propagate
    try {
      await this.redisClient.ZREMRANGEBYSCORE(
        userId,
        0,
        Date.now() - this.retentionDay
      );
      logger.info(`clean old records of user ${userId}`);
    } catch (e) {
      logger.error(`failed to clean old records ${e}`);
    }
  }
}

// Use 2 times of heartbeat interval of client at server side in case temporarily disconnection between client and server
export const streamManager = new StreamManager(
  RETENTION_DAY,
  HEARTBEAT_INTERVAL_IN_SECOND * 2,
  CONCURRENCY_LIMIT
);

export { StreamManager };
