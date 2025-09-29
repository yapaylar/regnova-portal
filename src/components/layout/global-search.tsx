"use client";

import { useMemo, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RECENT_COMPLAINTS, RECALLS, RESOURCES } from "@/data/mock";
import { useRole } from "@/context/role-context";

type SearchItem = {
  title: string;
  subtitle: string;
  href: string;
};

type GlobalSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { role } = useRole();
  const [query, setQuery] = useState("");

  const items = useMemo((): SearchItem[] => {
    return [
      ...RECENT_COMPLAINTS.map((complaint) => ({
        title: complaint.patientName,
        subtitle: `Complaint • ${complaint.status}`,
        href: `/track?id=${complaint.id}`,
      })),
      ...RECALLS.map((recall) => ({
        title: recall.device,
        subtitle: `Recall • ${recall.actionType}`,
        href: `/recalls?recall=${recall.id}`,
      })),
      ...RESOURCES.flatMap((section) =>
        section.items.map((item) => ({
          title: item.title,
          subtitle: `${section.category} • ${item.size}`,
          href: `/resources?category=${section.category}`,
        })),
      ),
    ];
  }, [role]);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border p-0">
        <Command shouldFilter={false} className="rounded-lg border">
          <CommandInput
            placeholder="Search devices, recalls, or tracking ID…"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No records found</CommandEmpty>
            <CommandGroup heading="Results">
              {filtered.map((item) => (
                <CommandItem
                  key={`${item.href}-${item.title}`}
                  value={`${item.title} ${item.subtitle}`}
                  onSelect={() => {
                    window.location.href = item.href;
                    onOpenChange(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

