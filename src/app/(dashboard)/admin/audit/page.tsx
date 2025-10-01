"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAuditLog } from "@/hooks/use-admin-audit";

const EVENT_LABELS: Record<string, string> = {
  AUTH_LOGIN_SUCCESS: "Auth Login Success",
  AUTH_LOGIN_FAILURE: "Auth Login Failure",
  AUTH_SIGNUP: "Auth Signup",
  AUTH_PASSWORD_RESET: "Password Reset",
  AUTH_TOKEN_REFRESH: "Token Refresh",
  AUTH_LOGOUT: "Auth Logout",
  REPORT_CREATED: "Report Created",
  REPORT_UPDATED: "Report Updated",
  REPORT_STATUS_CHANGED: "Report Status Changed",
};

const EVENT_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  AUTH_LOGIN_FAILURE: "destructive",
  AUTH_LOGOUT: "secondary",
  AUTH_TOKEN_REFRESH: "secondary",
  REPORT_CREATED: "default",
  REPORT_UPDATED: "default",
  REPORT_STATUS_CHANGED: "default",
  AUTH_SIGNUP: "default",
  AUTH_LOGIN_SUCCESS: "default",
  AUTH_PASSWORD_RESET: "default",
};

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [event, setEvent] = useState<string | undefined>(undefined);
  const { data, isLoading, isError } = useAdminAuditLog({
    search: search.length ? search : undefined,
    event,
  });

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Review recent changes across devices, complaints, and PMS records.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Input
                className="w-full sm:w-64"
                placeholder="Search message or metadata"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                value={event ?? "all"}
                onValueChange={(value) => setEvent(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {Object.keys(EVENT_LABELS).map((eventKey) => (
                    <SelectItem key={eventKey} value={eventKey}>
                      {EVENT_LABELS[eventKey]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Loading audit log…</div>
          ) : isError ? (
            <div className="flex h-48 items-center justify-center text-sm text-destructive">Failed to load audit log.</div>
          ) : rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No audit entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <Table className="min-w-[950px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Context</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{entry.user?.name ?? entry.user?.email ?? "System"}</TableCell>
                        <TableCell>
                          <Badge variant={EVENT_VARIANTS[entry.event] ?? "default"} className="uppercase">
                            {EVENT_LABELS[entry.event] ?? entry.event}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs whitespace-pre-wrap text-xs text-muted-foreground">
                          <div className="space-y-1">
                            <p>{entry.message}</p>
                            {entry.metadata ? (
                              <details className="rounded border border-muted px-2 py-1">
                                <summary className="cursor-pointer text-[11px] text-primary">Metadata</summary>
                                <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-4">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </details>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {entry.report?.trackingId ? <span>Report: {entry.report.trackingId}</span> : null}
                            {entry.ipAddress ? <span>IP: {entry.ipAddress}</span> : null}
                            {entry.userAgent ? <span>User Agent: {entry.userAgent}</span> : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        {data ? (
          <CardContent className="border-t bg-muted/40 py-3 text-xs text-muted-foreground">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {rows.length} of {data.total} entries
              </span>
              <div className="flex items-center gap-2">
                <span>
                  Page {data.page} / {Math.ceil(data.total / data.pageSize) || 1}
                </span>
              </div>
            </div>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

