export type StreamMap = { [key: string]: number };

export interface StreamQuery {
  userId: string;
  streamId: string;
  sessionId: string;
}

export interface Stream {
  score: number;
  value: string;
}
