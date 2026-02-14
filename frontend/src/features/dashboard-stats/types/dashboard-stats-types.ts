// frontend/src/features/dashboard-stats/types/dashboard-stats-types.ts
export type PaginatedData<TItem> = {
  data: TItem[];
  total?: number;
  current_page?: number;
  per_page?: number;
  last_page?: number;
};

export type DashboardStats = {
  students: number;
  programs: number;
  subjects: number;
  academicYears: number;
  semesters: number;
  courseOfferings: number;
  enrollments: number;
};
