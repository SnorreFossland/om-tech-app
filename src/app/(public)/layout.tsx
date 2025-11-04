import type { ReactNode } from 'react'
import TopNav from '@/components/shell/TopNav'

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-background">
            <TopNav />
            <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </div>
    )
}
