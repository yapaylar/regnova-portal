"use client"

import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react"

const THEME_STORAGE_KEY = "regnova-theme"

export type ThemeId = "aurora" | "pacific" | "slate" | "mint" | "setfug-prime"

type ThemeDefinition = {
  id: ThemeId
  name: string
  colors: Record<string, string>
}

const themes: ThemeDefinition[] = [
  {
    id: "slate",
    name: "Slate Night",
    colors: {
      "--background": "#ffffff",
      "--foreground": "#000000",
      "--card": "#ffffff",
      "--card-foreground": "#000000",
      "--popover": "#ffffff",
      "--popover-foreground": "#000000",
      "--primary": "#2600ce",
      "--primary-foreground": "#ffffff",
      "--secondary": "#0d0d0d",
      "--secondary-foreground": "#ffffff",
      "--muted": "#f4f4f4",
      "--muted-foreground": "#374151",
      "--accent": "#1f2937",
      "--accent-foreground": "#ffffff",
      "--destructive": "#f4212e",
      "--border": "#d4d4d4",
      "--border-strong": "#000000",
      "--input": "#d4d4d4",
      "--ring": "#2600ce",
      "--sidebar": "#ffffff",
      "--sidebar-foreground": "#1f2937",
      "--sidebar-primary": "#000000",
      "--sidebar-primary-foreground": "#ffffff",
      "--sidebar-accent": "#f6f6f6",
      "--sidebar-accent-foreground": "#374151",
      "--sidebar-border": "#d4d4d4",
      "--sidebar-ring": "#000000",
      "--header-background": "rgb(245 245 245 / 0.85)",
      "--header-background-blur": "rgb(245 245 245 / 0.7)",
    },
  },
  {
    id: "aurora",
    name: "Aurora Blue",
    colors: {
      "--background": "#f8faff",
      "--foreground": "#132237",
      "--card": "#ffffff",
      "--card-foreground": "#132237",
      "--popover": "#ffffff",
      "--popover-foreground": "#132237",
      "--primary": "#1c08fe",
      "--primary-foreground": "#ffffff",
      "--secondary": "#243e57",
      "--secondary-foreground": "#ffffff",
      "--muted": "#e8edff",
      "--muted-foreground": "#465a77",
      "--accent": "#7b7b7b",
      "--accent-foreground": "#ffffff",
      "--destructive": "#f05d6a",
      "--border": "#ced7f5",
      "--border-strong": "#ced7f5",
      "--input": "#ced7f5",
      "--ring": "#1c08fe",
      "--sidebar": "#f1f3ff",
      "--sidebar-foreground": "#132237",
      "--sidebar-primary": "#1c08fe",
      "--sidebar-primary-foreground": "#ffffff",
      "--sidebar-accent": "#e8edff",
      "--sidebar-accent-foreground": "#132237",
      "--sidebar-border": "#ced7f5",
      "--sidebar-ring": "#1c08fe",
    },
  },
  {
    id: "pacific",
    name: "Pacific Calm",
    colors: {
      "--background": "#f2f7f6",
      "--foreground": "#123134",
      "--card": "#ffffff",
      "--card-foreground": "#123134",
      "--popover": "#ffffff",
      "--popover-foreground": "#123134",
      "--primary": "#0f9cbc",
      "--primary-foreground": "#ffffff",
      "--secondary": "#156d7a",
      "--secondary-foreground": "#ffffff",
      "--muted": "#dceeee",
      "--muted-foreground": "#3b5d63",
      "--accent": "#78d1d9",
      "--accent-foreground": "#0b3740",
      "--destructive": "#e35d6a",
      "--border": "#c4dede",
      "--border-strong": "#c4dede",
      "--input": "#c4dede",
      "--ring": "#0f9cbc",
      "--sidebar": "#eff7f5",
      "--sidebar-foreground": "#123134",
      "--sidebar-primary": "#0f9cbc",
      "--sidebar-primary-foreground": "#ffffff",
      "--sidebar-accent": "#dceeee",
      "--sidebar-accent-foreground": "#123134",
      "--sidebar-border": "#c4dede",
      "--sidebar-ring": "#0f9cbc",
    },
  },
  {
    id: "mint",
    name: "Mint Care",
    colors: {
      "--background": "#f3faf8",
      "--foreground": "#0b302c",
      "--card": "#ffffff",
      "--card-foreground": "#0b302c",
      "--popover": "#ffffff",
      "--popover-foreground": "#0b302c",
      "--primary": "#0f7f6f",
      "--primary-foreground": "#ffffff",
      "--secondary": "#195a50",
      "--secondary-foreground": "#ffffff",
      "--muted": "#d9efe9",
      "--muted-foreground": "#2f4f4a",
      "--accent": "#52a694",
      "--accent-foreground": "#062824",
      "--destructive": "#d85151",
      "--border": "#bddfd6",
      "--border-strong": "#bddfd6",
      "--input": "#bddfd6",
      "--ring": "#0f7f6f",
      "--sidebar": "#e9f6f2",
      "--sidebar-foreground": "#0b302c",
      "--sidebar-primary": "#0f7f6f",
      "--sidebar-primary-foreground": "#ffffff",
      "--sidebar-accent": "#cde7df",
      "--sidebar-accent-foreground": "#0b302c",
      "--sidebar-border": "#bddfd6",
      "--sidebar-ring": "#0f7f6f",
    },
  },
  {
    id: "setfug-prime",
    name: "Setfug Prime",
    colors: {
      "--background": "#f5f9ff",
      "--foreground": "#1b2d45",
      "--card": "#ffffff",
      "--card-foreground": "#1b2d45",
      "--popover": "#ffffff",
      "--popover-foreground": "#1b2d45",
      "--primary": "#3487e7",
      "--primary-foreground": "#ffffff",
      "--secondary": "#2f6ec1",
      "--secondary-foreground": "#ffffff",
      "--muted": "#e1ecfb",
      "--muted-foreground": "#2a4363",
      "--accent": "#bcd6ff",
      "--accent-foreground": "#1b2d45",
      "--destructive": "#e35d6a",
      "--border": "#c7d9f4",
      "--border-strong": "#c7d9f4",
      "--input": "#c7d9f4",
      "--ring": "#3487e7",
      "--sidebar": "#f0f6ff",
      "--sidebar-foreground": "#1b2d45",
      "--sidebar-primary": "#3487e7",
      "--sidebar-primary-foreground": "#ffffff",
      "--sidebar-accent": "#dbe8fb",
      "--sidebar-accent-foreground": "#1b2d45",
      "--sidebar-border": "#c7d9f4",
      "--sidebar-ring": "#3487e7",
    },
  },
]

type ThemeContextValue = {
  theme: ThemeDefinition
  themes: ThemeDefinition[]
  setThemeById: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children, defaultTheme = "slate" }: { children: React.ReactNode; defaultTheme?: ThemeId }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return defaultTheme
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    return stored && themes.some((theme) => theme.id === stored) ? stored : defaultTheme
  })

  useLayoutEffect(() => {
    const activeTheme = themes.find((theme) => theme.id === themeId) ?? themes[0]
    const root = document.documentElement
    root.dataset.theme = activeTheme.id
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, activeTheme.id)
    }
  }, [themeId])

  const value = useMemo<ThemeContextValue>(() => {
    const activeTheme = themes.find((theme) => theme.id === themeId) ?? themes[0]
    return {
      theme: activeTheme,
      themes,
      setThemeById: setThemeId,
    }
  }, [themeId])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
