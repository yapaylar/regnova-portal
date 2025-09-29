import { ReportDraftProvider } from "@/context/report-draft-context";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportDraftProvider>{children}</ReportDraftProvider>;
}

