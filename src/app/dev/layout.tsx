import React from "react";
import DevNav from "@/components/dev/DevNav";

export const metadata = {
    title: 'Dev',
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-6">
            <h1 className="sr-only">Dev</h1>
            <DevNav />
            <main>
                {children}
            </main>
        </div>
    );
}
