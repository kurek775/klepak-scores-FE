export interface AgeCategory {
  id: number;
  event_id: number;
  name: string;
  min_age: number;
  max_age: number;
}

export interface AgeCategoryCreate {
  name: string;
  min_age: number;
  max_age: number;
}
