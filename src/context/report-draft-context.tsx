"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

export type ReportDraft = {
  id: string;
  step: string;
  data: Record<string, unknown>;
};

type ReportDraftContextValue = {
  draft: ReportDraft | null;
  updateDraft: (input: Partial<ReportDraft>) => void;
  clearDraft: () => void;
  hydrated: boolean;
};

const ReportDraftContext = createContext<ReportDraftContextValue | null>(null);

const REPORT_DRAFT_KEY = "regnova-report-draft";

export function ReportDraftProvider({ children }: { children: React.ReactNode }) {
  const { value, setValue, resetValue, hydrated } = useLocalStorage<ReportDraft | null>(
    REPORT_DRAFT_KEY,
    null,
  );

  const updateDraft = useCallback(
    (input: Partial<ReportDraft>) => {
      setValue((prev) => ({
        ...prev,
        id: input.id ?? prev?.id ?? crypto.randomUUID(),
        step: input.step ?? prev?.step ?? "report-type",
        data: {
          ...(prev?.data ?? {}),
          ...(input.data ?? {}),
        },
      }));
    },
    [setValue],
  );

  const clearDraft = useCallback(() => {
    resetValue();
  }, [resetValue]);

  const valueMemo = useMemo<ReportDraftContextValue>(
    () => ({
      draft: hydrated ? value : null,
      updateDraft,
      clearDraft,
      hydrated,
    }),
    [clearDraft, hydrated, updateDraft, value],
  );

  return (
    <ReportDraftContext.Provider value={valueMemo}>
      {children}
    </ReportDraftContext.Provider>
  );
}

export function useReportDraft() {
  const context = useContext(ReportDraftContext);

  if (!context) {
    throw new Error("useReportDraft must be used within a ReportDraftProvider");
  }

  return context;
}

