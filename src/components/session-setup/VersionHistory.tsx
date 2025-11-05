"use client";
import React from "react";
import { toast } from "sonner";

export default function VersionHistory({ templateId, onRevert }: { templateId: string; onRevert?: (snapshot: any) => void }) {
    const [items, setItems] = React.useState<any[] | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [reverting, setReverting] = React.useState<string | null>(null);
    const [pendingConfirm, setPendingConfirm] = React.useState<{ auditId: string; snapshot: any } | null>(null);

    React.useEffect(() => {
        if (!templateId) return;
        let mounted = true;
        setLoading(true);
        fetch(`/api/templates/${templateId}/history`)
            .then((r) => r.json())
            .then((d) => { if (mounted) setItems(Array.isArray(d) ? d : []); })
            .catch(() => { if (mounted) setItems([]); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [templateId]);

    if (!templateId) return null;

    async function handleRevertAudit(auditId: string, snapshotCandidate: any) {
        setReverting(auditId);
        setPendingConfirm(null);
        try {
            const res = await fetch(`/api/templates/${templateId}/revert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ auditId }),
            });

            if (res.status === 401) {
                toast.error('Unauthorized — please sign in');
                return;
            }

            if (!res.ok) {
                let msg = 'Failed to revert';
                try { const j = await res.json(); msg = j.error ?? JSON.stringify(j); } catch { msg = await res.text().catch(() => msg); }
                toast.error(msg);
                return;
            }

            const updated = await res.json().catch(() => null);
            toast.success('Reverted template');

            // Prefer the server-returned updated template; fall back to snapshot candidate
            onRevert?.(updated ?? snapshotCandidate);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? 'Error reverting');
        } finally {
            setReverting(null);
        }
    }

    return (
        <div className="p-3 border rounded space-y-2">
            <div className="font-medium">Version history</div>
            {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
            {items && items.length === 0 && <div className="text-sm text-muted-foreground">No history found.</div>}
            {items && items.map((it) => (
                <div key={it.id} className="p-2 border rounded">
                    <div className="text-xs">{new Date(it.createdAt).toLocaleString()}</div>
                    <div className="text-sm font-medium">{it.action}</div>
                    <div className="text-xs text-muted-foreground">{JSON.stringify(it.meta ?? {})}</div>
                    {it.meta?.prevSnapshot || it.meta?.snapshot ? (
                        <div className="mt-2 flex gap-2">
                            <button className="btn btn-sm" onClick={() => setPendingConfirm({ auditId: it.id, snapshot: it.meta.prevSnapshot ?? it.meta.snapshot })} disabled={reverting === it.id}>{reverting === it.id ? 'Reverting…' : 'Revert to this'}</button>
                        </div>
                    ) : null}
                </div>
            ))}
            {pendingConfirm ? (
                <div className="mt-3 p-3 border rounded bg-background">
                    <div className="font-medium">Confirm revert</div>
                    <div className="text-sm text-muted-foreground mt-1">You're about to revert the template to a previous snapshot. This will create a new version and cannot be undone except by another revert.</div>
                    <div className="mt-2 text-xs whitespace-pre font-mono max-h-40 overflow-auto p-2 bg-muted rounded">{JSON.stringify(pendingConfirm.snapshot, null, 2)}</div>
                    <div className="mt-3 flex gap-2">
                        <button className="btn btn-destructive btn-sm" onClick={() => handleRevertAudit(pendingConfirm.auditId, pendingConfirm.snapshot)} disabled={!!reverting}>{reverting ? 'Reverting…' : 'Confirm revert'}</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setPendingConfirm(null)} disabled={!!reverting}>Cancel</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
