// frontend/src/features/assessment/hooks/use-installments.ts
// Installment and payment actions for assessments.

import { useCallback, useState } from "react";
import { apiClient } from "../../../app/api/api-client";
import type { ApiResponse } from "../../../shared/types/api";
import type { Installment, InstallmentPlanPayload, Payment, PaymentPayload } from "../types/assessment-types";

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

type UseInstallmentsResult = {
  createInstallments: (assessmentId: number, payload: InstallmentPlanPayload) => Promise<Installment[]>;
  payInstallment: (installmentId: number, payload: PaymentPayload) => Promise<Payment>;
  isCreating: boolean;
  isPaying: (installmentId: number) => boolean;
  payingIds: number[];
};

export function useInstallments(): UseInstallmentsResult {
  const [isCreating, setIsCreating] = useState(false);
  const [payingIds, setPayingIds] = useState<number[]>([]);

  const toggleId = (
    ids: number[],
    id: number,
    action: "add" | "remove",
  ): number[] => {
    if (action === "add") {
      return ids.includes(id) ? ids : [...ids, id];
    }
    return ids.filter((existingId) => existingId !== id);
  };

  const createInstallments = useCallback(
    async (assessmentId: number, payload: InstallmentPlanPayload) => {
      setIsCreating(true);
      try {
        const response = await apiClient.post<ApiResponse<Installment[]>>(
          `/assessments/${assessmentId}/installments`,
          payload,
        );
        return ensureSuccess(response.data);
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const payInstallment = useCallback(async (installmentId: number, payload: PaymentPayload) => {
    setPayingIds((prev) => toggleId(prev, installmentId, "add"));
    try {
      const response = await apiClient.post<ApiResponse<Payment>>(
        `/installments/${installmentId}/pay`,
        payload,
      );
      return ensureSuccess(response.data);
    } finally {
      setPayingIds((prev) => toggleId(prev, installmentId, "remove"));
    }
  }, []);

  return {
    createInstallments,
    payInstallment,
    isCreating,
    isPaying: (installmentId) => payingIds.includes(installmentId),
    payingIds,
  };
}
