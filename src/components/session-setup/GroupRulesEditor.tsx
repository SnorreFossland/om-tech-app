"use client";
import React from "react";

type Role = { name: string; count: number };
type Rules = { maxParticipants?: number; roles?: Role[] };

export default function GroupRulesEditor({ rules, onChange }: { rules: Rules; onChange: (r: Rules) => void }) {
    const update = (patch: Partial<Rules>) => onChange({ ...(rules ?? {}), ...patch });

    const setRole = (idx: number, patch: Partial<Role>) => {
        const copy = [...(rules?.roles ?? [])];
        copy[idx] = { ...(copy[idx] ?? { name: '', count: 1 }), ...patch } as Role;
        update({ roles: copy });
    };

    const addRole = () => update({ roles: [...(rules?.roles ?? []), { name: 'Role', count: 1 }] });
    const removeRole = (idx: number) => {
        const copy = [...(rules?.roles ?? [])];
        copy.splice(idx, 1);
        update({ roles: copy });
    };

    return (
        <div className="space-y-3 p-3 border rounded">
            <div className="flex items-center gap-2">
                <label className="text-sm">Max participants</label>
                <input type="number" value={rules?.maxParticipants ?? ''} onChange={(e) => update({ maxParticipants: e.target.value ? Number(e.target.value) : undefined })} className="input w-32" />
            </div>

            <div>
                <div className="font-medium text-sm">Roles</div>
                <div className="space-y-2 mt-2">
                    {(rules?.roles ?? []).map((r, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input value={r.name} onChange={(e) => setRole(i, { name: e.target.value })} className="input flex-1" />
                            <input type="number" value={r.count} onChange={(e) => setRole(i, { count: Number(e.target.value) || 0 })} className="input w-20" />
                            <button onClick={() => removeRole(i)} className="btn btn-sm">Remove</button>
                        </div>
                    ))}
                    <div>
                        <button onClick={addRole} className="btn btn-sm">Add role</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
