export type TourDTO = {
  id: number;
  year: number | null;
  part: string | null;
  theme: string | null;
  template_id: number | null;
};

export type TourCreate = {
  year: number;
  part?: string | null;
  theme?: string | null;
  template_id?: number | null;
};

export type TourUpdate = Partial<TourCreate> & {
  // allow updating year too (optional)
  year?: number;
};
