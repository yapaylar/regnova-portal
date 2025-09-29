"use client";

import { ArrowUpRight, BarChart3, ListChecks, RefreshCw, ShieldAlert, ClipboardList, Layers, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DASHBOARD_METRICS, RECENT_COMPLAINTS, RECALLS } from "@/data/mock";
import { formatDate } from "@/lib/formatters";

const TAB_TRIGGER_CLASSES = "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Monitor post-market activity, resolve complaints, and stay compliant with confidence.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={ClipboardList}
          title="Report an Issue"
          description="Quickly log a complaint or adverse event with multi-step guidance, attachments, and draft support."
          helper="Track submissions instantly with generated IDs."
          ctaText="Start Report"
          href="/report"
          accent={{
            base: "#d7263d",
            soft: "rgba(215, 38, 61, 0.32)",
            surface: "rgba(215, 38, 61, 0.18)",
            border: "rgba(215, 38, 61, 0.42)",
            text: "#9f1b2d",
          }}
        />
        <FeatureCard
          icon={Layers}
          title="Recalls & Alerts"
          description="Monitor active recalls, filter by manufacturer or region, and download FSN packages in one place."
          helper="Stay ahead of corrective actions and affected lots."
          ctaText="View Recalls"
          href="/recalls"
          accent={{
            base: "#2600ce",
            soft: "rgba(38, 0, 206, 0.18)",
            surface: "rgba(38, 0, 206, 0.08)",
            border: "rgba(38, 0, 206, 0.35)",
            text: "#2600ce",
          }}
        />
        <FeatureCard
          icon={Search}
          title="Track Complaint"
          description="Enter a tracking ID to review current status, timeline notes, and next actions for your reports."
          helper="Keep stakeholders informed with real-time progress."
          ctaText="Track Now"
          href="/track"
          accent={{
            base: "#0f9cbc",
            soft: "rgba(15, 156, 188, 0.2)",
            surface: "rgba(15, 156, 188, 0.1)",
            border: "rgba(15, 156, 188, 0.32)",
            text: "#0f6a8c",
          }}
        />
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
              {metric.trend ? (
                <p className="text-xs text-muted-foreground">{metric.trend}</p>
              ) : null}
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
        <Tabs defaultValue="complaints" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="complaints" className={TAB_TRIGGER_CLASSES}>
              Recent Complaints
            </TabsTrigger>
            <TabsTrigger value="recalls" className={TAB_TRIGGER_CLASSES}>
              Recent Recalls
            </TabsTrigger>
            <TabsTrigger value="quick" className={TAB_TRIGGER_CLASSES}>
              Quick Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="space-y-3">
            {RECENT_COMPLAINTS.map((complaint) => (
              <Card key={complaint.id} className="border-muted bg-muted/10">
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{complaint.patientName}</CardTitle>
                    <CardDescription>
                      {complaint.facility} • {formatDate(complaint.submittedAt)}
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {complaint.status}
                  </span>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {complaint.summary}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recalls" className="space-y-3">
            {RECALLS.slice(0, 4).map((recall) => (
              <Card key={recall.id} className="border-muted bg-muted/10">
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{recall.device}</CardTitle>
                    <CardDescription>
                      {recall.manufacturer} • {formatDate(recall.date)}
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {recall.actionType}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{recall.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                      {recall.region}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                      Status: {recall.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="quick">
            <div className="grid gap-3 sm:grid-cols-3">
              <QuickAction
                icon={ShieldAlert}
                title="Start Report"
                description="Log a new complaint or adverse event in minutes."
                href="/report"
              />
              <QuickAction
                icon={RefreshCw}
                title="View Recalls"
                description="Review active recalls and corrective actions."
                href="/recalls"
              />
              <QuickAction
                icon={ListChecks}
                title="Track by ID"
                description="Monitor complaint progress with a tracking ID."
                href="/track"
              />
            </div>
          </TabsContent>
        </Tabs>
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

type QuickActionProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  href: string;
};

function QuickAction({ icon: Icon, title, description, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col rounded-lg border bg-card p-4 transition hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

type FeatureCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  helper: string
  ctaText: string
  href: string
  accent: FeatureAccent
}

type FeatureAccent = {
  base: string
  soft: string
  surface: string
  border: string
  text: string
}

function FeatureCard({ icon: Icon, title, description, helper, ctaText, href, accent }: FeatureCardProps) {
  const gradientLayerStyle: React.CSSProperties = {
    background: `radial-gradient(140% 120% at 0% 0%, ${accent.soft}, transparent 55%)`,
  }

  const iconStyle: React.CSSProperties = {
    background: accent.surface,
    color: accent.base,
    border: `1px solid ${accent.border}`,
    boxShadow: `0 22px 40px -28px ${accent.soft}`,
  }

  const helperStyle: React.CSSProperties = {
    border: `1px solid ${accent.border}`,
    background: `linear-gradient(135deg, ${accent.soft}, rgba(255,255,255,0.85))`,
  }

  const ctaStyle: React.CSSProperties = {
    border: `1px solid ${accent.border}`,
    backgroundColor: accent.surface,
    color: accent.text,
  }

  const avatarShades = [accent.surface, accent.soft, "rgba(0,0,0,0.04)"]

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card/95 shadow-[0_24px_60px_-35px_rgba(15,25,55,0.55)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_70px_-30px_rgba(15,25,55,0.45)]" style={{ borderColor: accent.border }}>
      <div className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" style={gradientLayerStyle} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent" />
      <CardHeader className="relative z-10 flex flex-col items-center gap-5 pb-0 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl shadow-lg shadow-black/5 ring-1 ring-white/60 transition-transform duration-300 group-hover:-translate-y-1" style={iconStyle}>
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-foreground/70">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 mt-auto flex flex-col gap-6 pt-6">
        <div className="rounded-2xl border p-4 text-sm leading-relaxed text-foreground/70" style={helperStyle}>
          {helper}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={href}
            className="group/cta inline-flex flex-shrink-0 items-center gap-2 rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap transition hover:brightness-105"
            style={ctaStyle}
          >
            {ctaText}   
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
          <div className="flex -space-x-1.5 overflow-hidden">
            {avatarShades.map((shade, idx) => (
              <span
                key={idx}
                className="size-7 rounded-full border border-white/80"
                style={{ backgroundColor: shade }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

