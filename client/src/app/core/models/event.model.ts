import { Activity } from './activity.model';

export enum EventStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Participant {
  id: number;
  display_name: string;
  external_id: string | null;
  gender: string | null;
  age: number | null;
  metadata: Record<string, string> | null;
}

export interface GroupSummary {
  id: number;
  name: string;
  identifier: string;
  participant_count: number;
}

export interface EvaluatorInfo {
  id: number;
  email: string;
  full_name: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  identifier: string;
  participants: Participant[];
  evaluators: EvaluatorInfo[];
}

export interface MyGroup {
  id: number;
  name: string;
  identifier: string;
  event_id: number;
  event_name: string;
  participant_count: number;
}

export interface EventSummary {
  id: number;
  name: string;
  status: EventStatus;
  created_by_id: number;
  created_at: string;
  group_count: number;
  participant_count: number;
}

export interface EventDetail {
  id: number;
  name: string;
  status: EventStatus;
  created_by_id: number;
  created_at: string;
  groups: GroupDetail[];
  activities: Activity[];
}

export interface ImportSummary {
  event_id: number;
  event_name: string;
  groups_created: number;
  participants_created: number;
}
