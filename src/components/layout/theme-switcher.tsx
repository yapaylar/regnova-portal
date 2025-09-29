"use client"

import { Check, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/context/theme-context"

export function ThemeSwitcher() {
  const { themes, theme, setThemeById } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="size-4" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((availableTheme) => (
          <DropdownMenuItem key={availableTheme.id} onSelect={() => setThemeById(availableTheme.id)}>
            <span className="flex items-center justify-between gap-2">
              <span>{availableTheme.name}</span>
              {theme.id === availableTheme.id ? <Check className="size-4" /> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
