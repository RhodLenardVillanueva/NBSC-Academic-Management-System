// frontend/src/features/faculty/grade-workflow/hooks/use-grade-actions.ts
// Faculty grade workflow hooks for grade updates and submissions.

import { useCallback, useState } from "react";
import { apiClient } from "../../../../app/api/api-client";
import type { ApiResponse } from "../../../../shared/types/api";
import type {
  GradeSubmissionResponse,
  GradeUpdatePayload,
} from "../types/grade-types";

type GradeActions = {
  saveGrade: (enrollmentSubjectId: number, payload: GradeUpdatePayload) => Promise<GradeSubmissionResponse>;
  submitGrade: (enrollmentSubjectId: number) => Promise<GradeSubmissionResponse>;
  isSaving: (enrollmentSubjectId: number) => boolean;
  isSubmitting: (enrollmentSubjectId: number) => boolean;
  savingIds: number[];
  submittingIds: number[];
};

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export function useGradeActions(): GradeActions {
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [submittingIds, setSubmittingIds] = useState<number[]>([]);

  const toggleId = (
    ids: number[],
    id: number,
    action: "add" | "remove",
  ): number[] => {
    if (action === "add") {
      return ids.includes(id) ? ids : [...ids, id];
    }
    return ids.filter((existing) => existing !== id);
  };

  const saveGrade = useCallback(
    async (enrollmentSubjectId: number, payload: GradeUpdatePayload) => {
      setSavingIds((prev) => toggleId(prev, enrollmentSubjectId, "add"));
      try {
        const response = await apiClient.put<ApiResponse<GradeSubmissionResponse>>(
          `/enrollment-subjects/${enrollmentSubjectId}/grade`,
          payload,
        );
        return ensureSuccess(response.data);
      } finally {
        setSavingIds((prev) => toggleId(prev, enrollmentSubjectId, "remove"));
      }
    },
    [],
  );

  const submitGrade = useCallback(async (enrollmentSubjectId: number) => {
    setSubmittingIds((prev) => toggleId(prev, enrollmentSubjectId, "add"));
    try {
      const response = await apiClient.post<ApiResponse<GradeSubmissionResponse>>(
        `/enrollment-subjects/${enrollmentSubjectId}/submit`,
      );
      return ensureSuccess(response.data);
    } finally {
      setSubmittingIds((prev) => toggleId(prev, enrollmentSubjectId, "remove"));
    }
  }, []);

  return {
    saveGrade,
    submitGrade,
    isSaving: (id) => savingIds.includes(id),
    isSubmitting: (id) => submittingIds.includes(id),
    savingIds,
    submittingIds,
  };
}
