"use client";
import React from "react";
import TemplateEditor from "@/components/session-setup/TemplateEditor";

export default function DevTemplateEditorPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Dev: Template Editor</h1>
      <p className="mb-4 text-sm text-slate-400">Use this page locally to create and edit templates. Requires sign-in.</p>
      <div className="max-w-3xl">
        <TemplateEditor />
      </div>
    </div>
  );
}
