"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import SectionEditor from "@/components/session-setup/SectionEditor";
import GroupRulesEditor from "@/components/session-setup/GroupRulesEditor";
import TemplatePreview from "@/components/session-setup/TemplatePreview";
import VersionHistory from "@/components/session-setup/VersionHistory";

type TemplateSchema = any;

export default function TemplateEditor({ initial }: { initial?: any }) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    // Maintain both raw text for the editor and the parsed schema object
    const initialSchema = initial?.schema ?? { sections: [] };
    const [schema, setSchema] = useState<TemplateSchema>(initialSchema);
    const [groupRulesError, setGroupRulesError] = useState<string | null>(null);
    const [schemaRaw, setSchemaRaw] = useState<string>(() => JSON.stringify(initialSchema, null, 2));
    const [schemaError, setSchemaError] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedTemplate, setSavedTemplate] = useState<any>(initial ?? null);
    // handle revert from history
    const handleRevert = (snapshot: any) => {
        if (!snapshot) return;
        // snapshot might be stored as { id, name, version, schema }
        const snapSchema = snapshot.schema ?? snapshot;
        if (snapshot.name) setName(snapshot.name);
        if (snapshot.description) setDescription(snapshot.description);
        if (snapSchema) {
            setSchema(snapSchema);
            setSchemaRaw(JSON.stringify(snapSchema, null, 2));
        }
    };

    async function save() {
        setSaving(true);
        setError(null);
        try {
            // Prevent submit if schema is invalid
            if (schemaError) {
                setError(`Invalid schema: ${schemaError}`);
                setSaving(false);
                return;
            }

            // Basic validation: require at least one field when updating
            if (initial?.id && name === initial?.name && description === initial?.description && JSON.stringify(schema) === JSON.stringify(initial?.schema)) {
                setError('No changes to save');
                setSaving(false);
                return;
            }

            const payload: any = {};
            if (name !== undefined) payload.name = name;
            if (description !== undefined) payload.description = description;
            if (schema !== undefined) payload.schema = schema;

            const res = await fetch(`/api/templates${initial?.id ? `/${initial.id}` : ""}`, {
                method: initial?.id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                // ensure cookies/session are sent to the API route
                credentials: "include",
            });

            if (res.status === 401) {
                // guide the developer to sign in when their session isn't present
                setError("Unauthorized — please sign in");
                setSaving(false);
                return;
            }

            if (!res.ok) {
                // try to parse JSON error, fallback to text
                let msg = "save failed";
                try {
                    const j = await res.json();
                    msg = j.error ?? JSON.stringify(j);
                } catch {
                    const t = await res.text();
                    msg = t || msg;
                }
                throw new Error(msg);
            }

            // success — parse returned template
            let data: any = null;
            try {
                data = await res.json();
            } catch { }
            if (data) {
                setSavedTemplate(data);
                toast.success("Template saved");
                setError(null);
            } else {
                toast.success("Template saved");
            }
            // optionally handle response
        } catch (err: any) {
            setError(err?.message ?? "Unknown error");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-4 bg-card rounded">
            <div className="mb-2">
                <label className="block text-sm">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
            </div>
            <div className="mb-2">
                <label className="block text-sm">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" />
            </div>
            <div className="mb-2">
                <label className="block text-sm">Schema (JSON)</label>
                <div className="space-y-3">
                    <SectionEditor sections={schema?.sections ?? []} onChange={(s) => {
                        const copy = { ...schema, sections: s };
                        setSchema(copy);
                        setSchemaRaw(JSON.stringify(copy, null, 2));
                    }} />

                    <div>
                        <label className="block text-sm mt-2">Group rules</label>
                        <div className="mt-2">
                            <React.Suspense fallback={<div>Loading rules editor…</div>}>
                                {/* @ts-ignore client component */}
                                <GroupRulesEditor rules={schema?.groupRules ?? {}} onChange={(r) => {
                                    const copy = { ...schema, groupRules: r };
                                    setSchema(copy);
                                    setSchemaRaw(JSON.stringify(copy, null, 2));
                                    // validate quick conflict: sum roles > maxParticipants
                                    const sum = (r.roles ?? []).reduce((acc, it) => acc + (it.count ?? 0), 0);
                                    if (r.maxParticipants && sum > r.maxParticipants) {
                                        setGroupRulesError(`Sum of role counts (${sum}) exceeds max participants (${r.maxParticipants})`);
                                    } else {
                                        setGroupRulesError(null);
                                    }
                                }} />
                            </React.Suspense>
                            {groupRulesError && <div className="text-yellow-600 mt-2">{groupRulesError}</div>}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setPreviewOpen(true)} className="btn btn-ghost">Preview schema</button>
                        <button onClick={() => { setSchemaRaw(JSON.stringify(schema, null, 2)); }} className="btn btn-outline">Sync JSON</button>
                    </div>
                    <textarea value={schemaRaw} onChange={(e) => {
                        const v = e.target.value;
                        setSchemaRaw(v);
                        try {
                            const parsed = JSON.parse(v);
                            setSchema(parsed);
                            setSchemaError(null);
                        } catch (err: any) {
                            setSchemaError(err?.message ?? 'Invalid JSON');
                        }
                    }} rows={6} className="w-full font-mono text-xs" />
                </div>
                {schemaError && <div className="text-red-500 mt-1">JSON parse error: {schemaError}</div>}
            </div>

            {previewOpen && (
                <div className="mt-4">
                    <TemplatePreview schema={schema} onClose={() => setPreviewOpen(false)} />
                </div>
            )}
            {error && (
                <div className="text-red-500">
                    <div>{error}</div>
                    {error?.toLowerCase().includes("unauthor") && (
                        <div className="mt-2">
                            <button onClick={() => signIn()} className="btn">Sign in</button>
                        </div>
                    )}
                </div>
            )}

            {savedTemplate && (
                <div className="mt-4 p-3 border rounded bg-card text-sm">
                    <div className="font-medium">Saved Template</div>
                    <div>ID: <code className="text-xs">{savedTemplate.id}</code></div>
                    {savedTemplate.version !== undefined && <div>Version: {savedTemplate.version}</div>}
                    {savedTemplate.createdBy && <div>Created by: {savedTemplate.createdBy}</div>}
                    {savedTemplate.updatedBy && <div>Updated by: {savedTemplate.updatedBy}</div>}
                </div>
            )}
            <div className="mt-2">
                <button onClick={save} disabled={saving || !!groupRulesError} className="btn">{saving ? 'Saving...' : 'Save Template'}</button>
            </div>
            {initial?.id && (
                <div className="mt-4">
                    <VersionHistory templateId={initial.id} onRevert={handleRevert} />
                </div>
            )}
        </div>
    );
}
