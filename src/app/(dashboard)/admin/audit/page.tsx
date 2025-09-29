"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_LOG } from "@/data/mock";

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Review recent changes across devices, complaints, and PMS records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {AUDIT_LOG.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.entity}</TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap text-xs text-muted-foreground">
                      {entry.before ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap text-xs text-muted-foreground">
                      {entry.after ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

