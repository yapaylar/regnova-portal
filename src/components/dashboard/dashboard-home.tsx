"use client";

import { ArrowUpRight, BarChart3, ClipboardList, Layers, ListChecks, RefreshCw, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_METRICS } from "@/data/mock";
import { useRole } from "@/context/role-context";

type FeatureAccent = {
  base: string;
  soft: string;
  surface: string;
  border: string;
  text: string;
};

type FeatureCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  helper: string;
  ctaText: string;
  href: string;
  accent: FeatureAccent;
};

const FEATURE_CARDS: FeatureCardProps[] = [
  {
    icon: ClipboardList,
    title: "Report an Issue",
    description: "Quickly log a complaint or adverse event with multi-step guidance, attachments, and draft support.",
    helper: "Track submissions instantly with generated IDs.",
    ctaText: "Start Report",
    href: "/report",
    accent: {
      base: "#d7263d",
      soft: "rgba(215, 38, 61, 0.32)",
      surface: "rgba(215, 38, 61, 0.18)",
      border: "rgba(215, 38, 61, 0.42)",
      text: "#9f1b2d",
    },
  },
  {
    icon: Layers,
    title: "Recalls & Alerts",
    description: "Monitor active recalls, filter by manufacturer or region, and download FSN packages in one place.",
    helper: "Stay ahead of corrective actions and affected lots.",
    ctaText: "View Recalls",
    href: "/recalls",
    accent: {
      base: "#2600ce",
      soft: "rgba(38, 0, 206, 0.18)",
      surface: "rgba(38, 0, 206, 0.08)",
      border: "rgba(38, 0, 206, 0.35)",
      text: "#2600ce",
    },
  },
  {
    icon: Search,
    title: "Track Complaint",
    description: "Enter a tracking ID to review current status, timeline notes, and next actions for your reports.",
    helper: "Keep stakeholders informed with real-time progress.",
    ctaText: "Track Now",
    href: "/track",
    accent: {
      base: "#0f9cbc",
      soft: "rgba(15, 156, 188, 0.2)",
      surface: "rgba(15, 156, 188, 0.1)",
      border: "rgba(15, 156, 188, 0.32)",
      text: "#0f6a8c",
    },
  },
];

export function DashboardHome() {
  const { name } = useRole();
  const greetingName = useMemo(() => name?.split(" ")[0] ?? "there", [name]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Welcome back, {greetingName}!</h1>
        <p className="text-muted-foreground text-sm">
          Monitor post-market activity, resolve complaints, and stay compliant with confidence.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_METRICS.map((metric) => (
          <Card key={metric.id} className="hover:border-primary/40 transition">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <MetricIcon metricId={metric.id} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{metric.value}</div>
              {metric.trend ? <p className="text-xs text-muted-foreground">{metric.trend}</p> : null}
              <Link
                href="/recalls"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
              >
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Need a deeper dive?</CardTitle>
            <CardDescription>Visit the reports workspace to review complaints, recalls, and quick actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-105"
            >
              Go to Reports
              <ArrowUpRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricIcon({ metricId }: { metricId: string }) {
  switch (metricId) {
    case "active-complaints":
      return <ShieldAlert className="size-5 text-primary" />;
    case "recalls":
      return <RefreshCw className="size-5 text-primary" />;
    case "devices":
      return <BarChart3 className="size-5 text-primary" />;
    case "pending":
      return <ListChecks className="size-5 text-primary" />;
    default:
      return null;
  }
}

function FeatureCard({ icon: Icon, title, description, helper, ctaText, href, accent }: FeatureCardProps) {
  const gradientLayerStyle: React.CSSProperties = {
    background: `radial-gradient(140% 120% at 0% 0%, ${accent.soft}, transparent 55%)`,
  };

  const iconStyle: React.CSSProperties = {
    background: accent.surface,
    color: accent.base,
    border: `1px solid ${accent.border}`,
    boxShadow: `0 22px 40px -28px ${accent.soft}`,
  };

  const helperStyle: React.CSSProperties = {
    border: `1px solid ${accent.border}`,
    background: `linear-gradient(135deg, ${accent.soft}, rgba(255,255,255,0.85))`,
  };

  const ctaStyle: React.CSSProperties = {
    border: `1px solid ${accent.border}`,
    backgroundColor: accent.surface,
    color: accent.text,
  };

  const avatarShades = [accent.surface, accent.soft, "rgba(0,0,0,0.04)"];

  return (
    <Card
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/90 shadow-[0_16px_40px_-28px_rgba(15,25,55,0.4)] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-26px_rgba(15,25,55,0.35)]"
      style={{ borderColor: accent.border }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        style={gradientLayerStyle}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent" />
      <CardHeader className="relative z-10 flex flex-col items-center gap-4 pb-0 text-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="inline-flex size-10 items-center justify-center rounded-2xl shadow-lg shadow-black/5 ring-1 ring-white/60 transition-transform duration-300 group-hover:-translate-y-0.5"
            style={iconStyle}
          >
            <Icon className="size-4" />
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-foreground/70">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 mt-auto flex flex-col gap-4 pt-5">
        <div className="rounded-2xl border p-3 text-sm leading-relaxed text-foreground/70" style={helperStyle}>
          {helper}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={href}
            className="group/cta inline-flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition hover:brightness-105"
            style={ctaStyle}
          >
            {ctaText}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
          <div className="flex -space-x-1.5 overflow-hidden">
            {avatarShades.map((shade, idx) => (
              <span key={`${title}-avatar-${idx}`} className="size-6 rounded-full border border-white/80" style={{ backgroundColor: shade }} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


