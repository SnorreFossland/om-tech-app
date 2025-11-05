"use client"
import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'

type Crumb = {
    href?: string
    label: string
    // icon should be a string key referencing a lucide-react export (e.g. 'Home')
    icon?: string
    current?: boolean
}

type Props = {
    items: Crumb[]
    className?: string
}

export default function Breadcrumb({ items, className }: Props) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                {items.map((it, idx) => {
                    const isLast = idx === items.length - 1
                    const Icon = it.icon ? (Icons as any)[it.icon] : undefined
                    return (
                        <li key={idx} className="flex items-center gap-2">
                            {it.href && !isLast ? (
                                <Link href={it.href} className="flex items-center hover:underline">
                                    {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                                    <span>{it.label}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center">
                                    {Icon ? <Icon className="w-4 h-4 mr-1" /> : null}
                                    <span className={isLast ? 'font-medium text-foreground' : ''}>{it.label}</span>
                                </div>
                            )}
                            {!isLast && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
