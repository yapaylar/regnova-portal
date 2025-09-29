"use client";

import { useCallback, useMemo, useRef } from "react";
import { Control } from "react-hook-form";
import { Upload, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

type AttachmentsStepProps = {
  control: Control<ReportFormValues>;
};

export function AttachmentsStep({ control }: AttachmentsStepProps) {
  return (
    <section className="space-y-4">
      <Alert>
        <AlertTitle>Upload files</AlertTitle>
        <AlertDescription>
          Attach up to 10 files (PDF, JPG, PNG). Maximum size: 10MB per file.
        </AlertDescription>
      </Alert>

      <FormField
        control={control}
        name="attachments"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <Dropzone value={field.value ?? []} onChange={field.onChange} />
            <FormDescription>Drag and drop files or select from your device.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

type Attachment = ReportFormValues["attachments"][number];

type DropzoneProps = {
  value: Attachment[];
  onChange: (files: Attachment[]) => void;
};

function Dropzone({ value, onChange }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const mapped = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      } satisfies Attachment));

      onChange([...value, ...mapped].slice(0, 10));
    },
    [onChange, value],
  );

  const removeFile = useCallback(
    (id: string) => {
      onChange(value.filter((file) => file.id !== id));
    },
    [onChange, value],
  );

  const totalSize = useMemo(
    () =>
      value.reduce((acc, file) => {
        return acc + file.size;
      }, 0),
    [value],
  );

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted bg-muted/20 p-6 text-center"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
      >
        <Upload className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground">PDF, PNG, JPG • Max 10MB each • Up to 10 files</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="application/pdf,image/png,image/jpeg"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <Button type="button" variant="outline" size="sm">
          Browse files
        </Button>
      </div>

      {value.length > 0 ? (
        <ScrollArea className="max-h-60 rounded-md border">
          <ul className="divide-y">
            {value.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground">No files added</p>
      )}

      {totalSize > 0 ? (
        <p className="text-xs text-muted-foreground">Total size: {formatBytes(totalSize)}</p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        className={cn("inline-flex items-center gap-2")}
      >
        <Upload className="size-4" />
        Add files
      </Button>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

