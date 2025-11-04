import React from "react";
import { Card } from "@/components/ui/card";

interface PanelProps {
    title: string;
    children: React.ReactNode;
}

export default function Panel({ title, children }: PanelProps) {
    return (
        <Card className="h-full flex flex-col">
            <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <div className="flex-1 p-6 overflow-auto">
                {children}
            </div>
        </Card>
    );
}
