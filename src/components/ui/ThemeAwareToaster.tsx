"use client";
import React from "react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function ThemeAwareToaster() {
    const { resolvedTheme, systemTheme } = useTheme();
    // resolvedTheme can be 'light' | 'dark' | undefined during hydration
    const theme = resolvedTheme ?? systemTheme ?? "light";

    // Sonner supports a `theme` prop ('light'|'dark') in v2 — pass it so toasts match.
    return <Toaster richColors theme={theme === "dark" ? "dark" : "light"} />;
}
