export interface ParticipantRank {
  rank: number;
  participant_id: number;
  display_name: string;
  gender: string | null;
  age: number | null;
  value: string;
  group_name: string | null;
}

export interface CategoryRanking {
  gender: string;
  age_category_name: string;
  participants: ParticipantRank[];
}

import { EvaluationType } from './activity.model';

export interface ActivityLeaderboard {
  activity_id: number;
  activity_name: string;
  evaluation_type: EvaluationType;
  categories: CategoryRanking[];
}

export interface LeaderboardResponse {
  event_id: number;
  event_name: string;
  has_age_categories: boolean;
  activities: ActivityLeaderboard[];
}
