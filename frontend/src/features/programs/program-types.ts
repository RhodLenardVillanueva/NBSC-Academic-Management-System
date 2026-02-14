// frontend/src/features/programs/program-types.ts
export type Program = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgramFormValues = {
  name: string;
  code: string;
  description: string;
};

export type ProgramPayload = {
  name: string;
  code: string;
  description: string | null;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
