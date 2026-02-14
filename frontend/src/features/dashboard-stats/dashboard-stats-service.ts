// frontend/src/features/dashboard-stats/dashboard-stats-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { DashboardStats, PaginatedData } from "./types/dashboard-stats-types";

const getTotalFromPaginated = (payload: PaginatedData<Record<string, unknown>>): number => {
  if (typeof payload.total === "number") {
    return payload.total;
  }
  if (Array.isArray(payload.data)) {
    return payload.data.length;
  }
  return 0;
};

const fetchCount = async (endpoint: string): Promise<number> => {
  const response = await apiClient.get<ApiResponse<PaginatedData<Record<string, unknown>>>>(
    endpoint,
  );

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return getTotalFromPaginated(response.data.data);
};

export const dashboardStatsService = {
  async getStats(): Promise<DashboardStats> {
    const [
      students,
      programs,
      subjects,
      academicYears,
      semesters,
      courseOfferings,
      enrollments,
    ] = await Promise.all([
      fetchCount("/students"),
      fetchCount("/programs"),
      fetchCount("/subjects"),
      fetchCount("/academic-years"),
      fetchCount("/semesters"),
      fetchCount("/course-offerings"),
      fetchCount("/enrollments"),
    ]);

    return {
      students,
      programs,
      subjects,
      academicYears,
      semesters,
      courseOfferings,
      enrollments,
    };
  },
};
