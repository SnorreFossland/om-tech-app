import React from 'react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PropertyDetail from '@/components/property/PropertyDetail'
import { getPropertyById } from '@/lib/database/property-queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type Props = { params: { id: string } }

export default async function PropertyDetailPage({ params }: Props) {
    // `params` may be a Promise depending on Next.js internals; unwrap if necessary
    const resolved = typeof (params as any)?.then === 'function' ? await params : params
    const { id } = resolved as { id: string }
    const property = await getPropertyById(id)

    if (!property) return notFound()

    type PropertyType = NonNullable<Awaited<ReturnType<typeof getPropertyById>>>
    const p = property as PropertyType

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-4 flex items-center justify-between">
                <div className="sm:hidden">
                    <Link href="/properties" className="p-2 rounded border inline-flex items-center" aria-label="Back to properties">
                        <ChevronLeft size={16} />
                        <span className="sr-only">Back</span>
                    </Link>
                </div>
                <h1 className="text-2xl font-semibold">{p.title || 'Property'}</h1>
                <div className="hidden sm:block" />
            </div>
            <Breadcrumb
                items={[
                    { href: '/', label: 'Home', icon: 'Home' },
                    { href: '/properties', label: 'Properties' },
                    { label: p.title || 'Property' },
                ]}
                className="mb-4"
            />
            {/* normalize representative null -> undefined for component props */}
            <PropertyDetail property={{ ...p, representative: p.representative ?? undefined }} />
        </div>
    )
}
