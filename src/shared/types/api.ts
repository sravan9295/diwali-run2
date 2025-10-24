export interface HealthResponse {
  status: string;
  timestamp: string;
  game: string;
}

export interface ScoreResponse {
  highScore: number;
  userId?: string;
}

export interface SaveScoreRequest {
  score: number;
}

export interface SaveScoreResponse {
  newHighScore: boolean;
  score: number;
  highScore?: number;
  previousHighScore?: number;
}