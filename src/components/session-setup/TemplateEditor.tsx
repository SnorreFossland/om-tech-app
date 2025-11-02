"use client";
import React, { useState } from "react";

type TemplateSchema = any;

export default function TemplateEditor({ initial }: { initial?: any }) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    // Maintain both raw text for the editor and the parsed schema object
    const initialSchema = initial?.schema ?? { sections: [] };
    const [schema, setSchema] = useState<TemplateSchema>(initialSchema);
    const [schemaRaw, setSchemaRaw] = useState<string>(() => JSON.stringify(initialSchema, null, 2));
    const [schemaError, setSchemaError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'save failed');
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
                <textarea
                    value={schemaRaw}
                    onChange={(e) => {
                        const v = e.target.value;
                        setSchemaRaw(v);
                        try {
                            const parsed = JSON.parse(v);
                            setSchema(parsed);
                            setSchemaError(null);
                        } catch (err: any) {
                            setSchemaError(err?.message ?? 'Invalid JSON');
                        }
                    }}
                    rows={8}
                    className="w-full font-mono text-xs"
                />
                {schemaError && <div className="text-red-500 mt-1">JSON parse error: {schemaError}</div>}
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div className="mt-2">
                <button onClick={save} disabled={saving} className="btn">{saving ? 'Saving...' : 'Save Template'}</button>
            </div>
        </div>
    );
}
