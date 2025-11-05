"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplatePreview from "@/components/session-setup/TemplatePreview";

type Template = {
    id: string;
    name: string;
    description?: string | null;
    version?: number;
    createdBy?: string | null;
};

export default function TemplateSelector({ onSelect }: { onSelect?: (t: Template | null) => void; }) {
    const [templates, setTemplates] = React.useState<Template[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/templates')
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                setTemplates(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) setSelectedId(data[0].id);
            })
            .catch(() => setTemplates([]))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    const selected = templates.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Choose a template</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading templates…</p>
                    ) : templates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No templates found. Create one in the Template Editor.</p>
                    ) : (
                        <div className="flex items-center gap-4">
                            <select className="input" value={selectedId ?? ''} onChange={(e) => setSelectedId(e.target.value)}>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name} {t.version ? `(v${t.version})` : ''}</option>
                                ))}
                            </select>
                            <div className="flex-1 text-sm text-muted-foreground">
                                <div className="font-medium">{selected?.name}</div>
                                <div className="text-xs">{selected?.description ?? 'No description'}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex gap-2">
                        <Button onClick={() => onSelect?.(selected)} disabled={!selected}>Use template</Button>
                        <Button variant="ghost" onClick={() => setPreviewOpen(true)} disabled={!selected}>Preview</Button>
                    </div>
                </CardFooter>
            </Card>

            {selected && (
                <Card>
                    <CardHeader>
                        <CardTitle>Selected template details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(selected, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}

            {previewOpen && selected && (
                <div className="mt-4">
                    {/* Lazy load preview component so it's small and focused */}
                    <React.Suspense fallback={<div>Loading preview…</div>}>
                        <TemplatePreview schema={selected.schema} onClose={() => setPreviewOpen(false)} />
                    </React.Suspense>
                </div>
            )}
        </div>
    );
}
