"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TemplatePreview({ schema, onClose }: { schema: any; onClose?: () => void }) {
    if (!schema) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No schema available to preview.</p>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </CardFooter>
            </Card>
        );
    }

    // If schema uses a sections array, render it in a friendly way
    const sections = Array.isArray(schema?.sections) ? schema.sections : null;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Template preview</CardTitle>
                </CardHeader>
                <CardContent>
                    {sections ? (
                        <div className="space-y-3">
                            {sections.map((sec: any, idx: number) => (
                                <div key={idx} className="p-3 border rounded">
                                    <div className="font-semibold">{sec.title ?? sec.name ?? `Section ${idx + 1}`}</div>
                                    {sec.description && <div className="text-sm text-muted-foreground">{sec.description}</div>}
                                    {Array.isArray(sec.items) && (
                                        <ul className="mt-2 list-disc ml-5 text-sm">
                                            {sec.items.map((it: any, i: number) => (
                                                <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(schema, null, 2)}</pre>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
