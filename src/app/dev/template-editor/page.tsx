"use client";
import React from "react";
import TemplateEditor from "@/components/session-setup/TemplateEditor";
import { useSession, signIn } from "next-auth/react";

export default function DevTemplateEditorPage() {
    const { data: session, status } = useSession();

    // only consider the auth status "stable" after it stays the same for a short window
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

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Dev: Template Editor</h1>
            <p className="mb-4 text-sm text-slate-400">Use this page locally to create and edit templates. Requires sign-in.</p>

            {(status === "loading" || stableStatus !== status) ? (
                <div className="rounded border p-6 bg-slate-900/20">
                    <p className="text-sm text-slate-400">Checking authentication status…</p>
                </div>
            ) : stableStatus === "unauthenticated" ? (
                <div className="rounded border p-6 bg-slate-900/40">
                    <p className="mb-4">You are not signed in. Please sign in to create templates.</p>
                    <div className="flex gap-2">
                        <button onClick={() => signIn()} className="btn">Sign in</button>
                        <a href="/auth/signup" className="btn-ghost">Sign up</a>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl">
                    <TemplateEditor />
                </div>
            )}
        </div>
    );
}
