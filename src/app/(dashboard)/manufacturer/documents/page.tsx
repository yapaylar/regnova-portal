"use client";

import { useMemo, useState } from "react";
import { CloudUpload, FileText, FolderPlus, Search } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useManufacturerDocuments } from "@/hooks/use-manufacturer-documents";
import { useDebounce } from "@/hooks/use-debounce";

export default function ManufacturerDocumentsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useManufacturerDocuments({ search: debouncedSearch });

  const folders = useMemo(() => data?.folders ?? [], [data?.folders]);
  const files = useMemo(() => data?.files ?? [], [data?.files]);

  const folderStats = useMemo(() => {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.sizeBytes, 0);
    return { totalFolders: folders.length, totalFiles, totalSize };
  }, [folders, files]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Document Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Organize manuals, certificates, and supporting material for your devices. Share the latest versions with facilities easily.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Folders" value={folderStats.totalFolders} helper="Active collections" />
        <MetricCard title="Files" value={folderStats.totalFiles} helper="Total assets" />
        <MetricCard
          title="Storage"
          value={formatSize(folderStats.totalSize)}
          helper="Combined size"
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Repository</CardTitle>
            <CardDescription>Search folders or files and manage their versions.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FolderPlus className="size-4" />
              New Folder
            </Button>
            <Button className="gap-2">
              <CloudUpload className="size-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by document title or filename"
              className="w-full pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Tabs defaultValue="files" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-2">
              <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Files
              </TabsTrigger>
              <TabsTrigger value="folders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Folders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files">
              {isLoading ? (
                <StateMessage state="loading" />
              ) : isError ? (
                <StateMessage state="error" />
              ) : files.length === 0 ? (
                <StateMessage state="empty" helper="Upload the first document to get started." />
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <div className="min-w-[860px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Folder</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="size-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{file.title}</span>
                                  <span className="text-xs text-muted-foreground">{file.filename}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{file.folder.name}</TableCell>
                            <TableCell>{file.device ? `${file.device.name}${file.device.modelNumber ? ` · ${file.device.modelNumber}` : ""}` : "—"}</TableCell>
                            <TableCell>
                              {file.version ? <Badge variant="secondary">v{file.version}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>{formatSize(file.sizeBytes)}</TableCell>
                            <TableCell>{format(new Date(file.uploadedAt), "PP")}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="text-xs">Download</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="folders">
              {isLoading ? (
                <StateMessage state="loading" />
              ) : isError ? (
                <StateMessage state="error" />
              ) : folders.length === 0 ? (
                <StateMessage state="empty" helper="Create a folder to start organizing documents." />
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {folders.map((folder) => (
                      <Card key={folder.id} className="border-dashed">
                        <CardHeader>
                          <CardTitle className="text-base">{folder.name}</CardTitle>
                          {folder.description ? <CardDescription>{folder.description}</CardDescription> : null}
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-1">
                          <p>Created {format(new Date(folder.createdAt), "PP")}</p>
                          <p>Updated {format(new Date(folder.updatedAt), "PP")}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string | number; helper: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function StateMessage({ state, helper }: { state: "loading" | "error" | "empty"; helper?: string }) {
  if (state === "loading") {
    return <p className="text-sm text-muted-foreground">Loading documents…</p>;
  }

  if (state === "error") {
    return <p className="text-sm text-destructive">Failed to load documents.</p>;
  }

  return <p className="text-sm text-muted-foreground">{helper ?? "No documents found."}</p>;
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

