export type DiplomaItemType = 'DYNAMIC' | 'STATIC';
export type DynamicKey = 'participant_name' | 'place' | 'activity' | 'category';
export type FontWeight = 'normal' | 'bold' | 'italic';

export interface DiplomaFont {
  name: string;
  data: string; 
}

export interface DiplomaItem {
  type: DiplomaItemType;
  key?: DynamicKey;
  text?: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  fontFamily?: string; 
  centerH?: boolean;  
  centerV?: boolean;  
}

export interface DiplomaTemplate {
  id: number;
  event_id: number;
  bg_image_url: string | null;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  items: DiplomaItem[];
  fonts: DiplomaFont[];
  default_font: string | null;
  created_at: string;
}
