export enum EvaluationType {
  NUMERIC_HIGH = 'NUMERIC_HIGH',
  NUMERIC_LOW = 'NUMERIC_LOW',
  BOOLEAN = 'BOOLEAN',
  SCORE_SET = 'SCORE_SET',
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  evaluation_type: EvaluationType;
  event_id: number;
  created_at: string;
}

export interface ScoreRecord {
  id: number;
  value_raw: string | number;
  participant_id: number;
  activity_id: number;
  evaluator_id: number;
  created_at: string;
}
