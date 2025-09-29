"use client";

import { ReactNode } from "react";

type WizardFooterProps = {
  children: ReactNode;
  helper?: ReactNode;
};

export function WizardFooter({ children, helper }: WizardFooterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">{helper}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

