"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DevNav() {
    const pathname = usePathname() ?? "";
    const items = [
        { href: "/dev/template-editor", label: "Template Editor" },
        { href: "/dev/session-creator", label: "Session Creator" },
    ];

    return (
        <nav className="mb-4">
            <div className="flex gap-2">
                {items.map((it) => {
                    const isActive = pathname === it.href || pathname.startsWith(it.href + "/");
                    return (
                        <Link key={it.href} href={it.href} legacyBehavior>
                            <Button asChild size="sm" variant={isActive ? "default" : "outline"}>
                                <a>{it.label}</a>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
