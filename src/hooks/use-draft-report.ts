"use client";

import { useMemo } from "react";

import { useReportDraft } from "@/context/report-draft-context";
import { defaultReportValues, reportSchema } from "@/lib/validation";

export function useDraftReport() {
  const { draft, updateDraft, clearDraft, hydrated } = useReportDraft();

  const mergedData = useMemo(() => {
    return {
      ...defaultReportValues,
      ...(draft?.data ?? {}),
    };
  }, [draft]);

  const data = useMemo(() => {
    const parsed = reportSchema.safeParse(mergedData);
    return parsed.success ? parsed.data : mergedData;
  }, [mergedData]);

  return {
    draft,
    hydrated,
    data,
    updateDraft,
    clearDraft,
  };
}

