"use client";
import React from "react";

export default function SectionEditor({ sections, onChange }: { sections: any[]; onChange: (s: any[]) => void }) {
    const updateSection = (idx: number, patch: Partial<any>) => {
        const copy = [...sections];
        copy[idx] = { ...copy[idx], ...patch };
        onChange(copy);
    };

    const addSection = () => {
        onChange([...(sections ?? []), { title: 'New section', description: '', items: [] }]);
    };

    const removeSection = (idx: number) => {
        const copy = [...sections];
        copy.splice(idx, 1);
        onChange(copy);
    };

    const addItem = (idx: number) => {
        const copy = [...sections];
        copy[idx].items = [...(copy[idx].items ?? []), ''];
        onChange(copy);
    };

    const updateItem = (sIdx: number, iIdx: number, v: string) => {
        const copy = [...sections];
        copy[sIdx].items = [...(copy[sIdx].items ?? [])];
        copy[sIdx].items[iIdx] = v;
        onChange(copy);
    };

    const removeItem = (sIdx: number, iIdx: number) => {
        const copy = [...sections];
        copy[sIdx].items = [...(copy[sIdx].items ?? [])];
        copy[sIdx].items.splice(iIdx, 1);
        onChange(copy);
    };

    return (
        <div className="space-y-3">
            {(sections ?? []).map((sec, idx) => (
                <div key={idx} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <input value={sec.title ?? ''} onChange={(e) => updateSection(idx, { title: e.target.value })} className="w-full font-semibold" />
                            <input value={sec.description ?? ''} onChange={(e) => updateSection(idx, { description: e.target.value })} className="w-full text-sm text-muted-foreground mt-1" />
                        </div>
                        <div className="ml-2">
                            <button onClick={() => removeSection(idx)} className="btn btn-sm">Remove</button>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-xs font-medium">Items</div>
                        <div className="space-y-1 mt-1">
                            {(sec.items ?? []).map((it: any, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <input value={it ?? ''} onChange={(e) => updateItem(idx, i, e.target.value)} className="flex-1 text-sm" />
                                    <button onClick={() => removeItem(idx, i)} className="btn btn-sm">x</button>
                                </div>
                            ))}
                            <div>
                                <button onClick={() => addItem(idx)} className="btn btn-sm">Add item</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div>
                <button onClick={addSection} className="btn">Add section</button>
            </div>
        </div>
    );
}
