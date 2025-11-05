"use client";
import React from "react";
import TemplateSelector from "@/components/session-setup/TemplateSelector";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DevSessionCreatorPage() {
    const { data: session, status } = useSession();
    const [stableStatus, setStableStatus] = React.useState<typeof status>(status);
    React.useEffect(() => {
        let canceled = false;
        const t = setTimeout(() => {
            if (!canceled) setStableStatus(status);
        }, 300);
        return () => {
            canceled = true;
            clearTimeout(t);
        };
    }, [status]);

    const [selectedTemplate, setSelectedTemplate] = React.useState<any | null>(null);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Dev: Session Creator</h1>
            <p className="mb-4 text-sm text-slate-400">Use this page locally to pick a template and simulate session creation. Requires sign-in.</p>

            {(status === "loading" || stableStatus !== status) ? (
                <div className="rounded border p-6 bg-slate-900/20">
                    <p className="text-sm text-slate-400">Checking authentication status…</p>
                </div>
            ) : stableStatus === "unauthenticated" ? (
                <div className="rounded border p-6 bg-slate-900/40">
                    <p className="mb-4">You are not signed in. Please sign in to create sessions.</p>
                    <div className="flex gap-2">
                        <button onClick={() => signIn()} className="btn">Sign in</button>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl space-y-4">
                    <TemplateSelector onSelect={(t) => setSelectedTemplate(t)} />

                    <div className="flex items-center gap-2">
                        <Button onClick={async () => {
                            if (!selectedTemplate) return;
                            try {
                                const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `Session: ${selectedTemplate.name}`, templateId: selectedTemplate.id }), credentials: 'include' });
                                if (res.status === 401) return signIn();
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed');
                                alert(JSON.stringify({ created: true, session: data }, null, 2));
                            } catch (e: any) {
                                alert('Error creating session: ' + (e?.message ?? e));
                            }
                        }} disabled={!selectedTemplate}>Create session from template</Button>
                    </div>

                    {selectedTemplate && (
                        <div className="rounded border p-4">
                            <h3 className="font-medium">Simulated session payload</h3>
                            <pre className="text-xs mt-2">{JSON.stringify({ templateId: selectedTemplate.id, templateName: selectedTemplate.name }, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
