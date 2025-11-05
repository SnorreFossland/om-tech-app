"use client";
import React from "react";
import TemplateSelector from "@/components/session-setup/TemplateSelector";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function CreateSessionPage() {
    const [selectedTemplate, setSelectedTemplate] = React.useState<any | null>(null);
    const [creating, setCreating] = React.useState(false);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Create session</h1>
            <p className="mb-4 text-sm text-slate-400">Choose a template to start a new session.</p>

            <div className="max-w-3xl space-y-4">
                <TemplateSelector onSelect={(t) => setSelectedTemplate(t)} />

                <div className="flex items-center gap-2">
                    <Button onClick={async () => {
                        if (!selectedTemplate) return;
                        setCreating(true);
                        try {
                            const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `Session: ${selectedTemplate.name}`, templateId: selectedTemplate.id }), credentials: 'include' });
                            if (res.status === 401) return signIn();
                            const data = await res.json();
                            if (!res.ok) throw new Error(data?.error || 'Failed');
                            // navigate to session page or show created data
                            alert(JSON.stringify({ created: true, session: data }, null, 2));
                        } catch (e: any) {
                            alert('Error creating session: ' + (e?.message ?? e));
                        } finally {
                            setCreating(false);
                        }
                    }} disabled={!selectedTemplate || creating}>{creating ? 'Creating…' : 'Create session from template'}</Button>
                </div>

                {selectedTemplate && (
                    <div className="rounded border p-4">
                        <h3 className="font-medium">Selected template</h3>
                        <pre className="text-xs mt-2">{JSON.stringify({ templateId: selectedTemplate.id, templateName: selectedTemplate.name }, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
