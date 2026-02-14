// frontend/src/features/assessment/hooks/use-assessment.ts
// Assessment hooks for fetching assessment data and summaries.

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../app/api/api-client";
import type { ApiResponse } from "../../../shared/types/api";
import { assessmentService } from "../assessment-service";
import { enrollmentService } from "../../enrollments/enrollment-service";
import type {
  Assessment,
  AssessmentCreatePayload,
  AssessmentCor,
  AssessmentSummary,
} from "../types/assessment-types";

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

type UseAssessmentResult = {
  cor: AssessmentCor | null;
  assessment: Assessment | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  createAssessment: (payload: AssessmentCreatePayload) => Promise<void>;
};

type UseAssessmentSummaryResult = {
  summary: AssessmentSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAssessment(enrollmentId: number): UseAssessmentResult {
  const [cor, setCor] = useState<AssessmentCor | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [corResult, assessmentResult] = await Promise.all([
        enrollmentService.cor(enrollmentId),
        assessmentService.getByEnrollment(enrollmentId),
      ]);
      setCor(corResult);
      setAssessment(assessmentResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load assessment.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createAssessment = useCallback(
    async (payload: AssessmentCreatePayload) => {
      setIsCreating(true);
      setCreateError(null);
      try {
        await assessmentService.createForEnrollment(enrollmentId, payload);
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create assessment.";
        setCreateError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [enrollmentId, refresh],
  );

  return {
    cor,
    assessment,
    isLoading,
    error,
    refresh,
    isCreating,
    createError,
    createAssessment,
  };
}

export function useAssessmentSummary(assessmentId: number): UseAssessmentSummaryResult {
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<AssessmentSummary>>(
        `/assessments/${assessmentId}/summary`,
      );
      setSummary(ensureSuccess(response.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load assessment summary.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    isLoading,
    error,
    refresh,
  };
}
