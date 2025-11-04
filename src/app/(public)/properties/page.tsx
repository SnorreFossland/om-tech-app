"use client"
import React, { useState } from 'react'
// router not needed on listing page; back button lives on detail page
import Breadcrumb from '@/components/ui/Breadcrumb'
import SearchBar from '@/components/property/SearchBar'
import SearchFilters from '@/components/property/SearchFilters'
import PropertyGrid from '@/components/property/PropertyGrid'
import { useGetPropertiesQuery } from '@/store/services/properties.api'

type Property = any

export default function PropertiesPage() {
    // const router = useRouter() // not used here (back button only on detail page)
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [page, setPage] = useState(1)
    const [filtersOpen, setFiltersOpen] = useState(false)

    const { data, isLoading } = useGetPropertiesQuery({
        city: filters.city,
        propertyType: filters.propertyType,
        bedrooms: filters.bedrooms,
        page,
        pageSize: 20,
    })

    const properties = data?.data || []

    return (
        <div>
            <Breadcrumb
                items={[{ href: '/', label: 'Home', icon: 'Home' }, { label: 'Properties' }]}
                className="mb-4"
            />
            <div className="max-w-6xl mx-auto py-8">
                {/* Compact header: page title and small back button on mobile */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Properties</h1>
                    <div className="sm:hidden">
                        {/* Mobile filters toggle */}
                        <button onClick={() => setFiltersOpen(true)} className="px-2 py-1 border rounded text-sm">Filters</button>
                    </div>
                </div>
                <div className="mb-4">
                    <SearchBar onSearch={(city) => setFilters((s) => ({ ...s, city }))} />
                </div>
                {/* Mobile filters drawer */}
                {/* Mobile filters drawer: rendered always so we can animate via CSS transforms/opacity */}
                <div className="fixed inset-0 z-50 pointer-events-none">
                    {/* overlay */}
                    <div
                        className={`absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${filtersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
                        onClick={() => setFiltersOpen(false)}
                        aria-hidden={!filtersOpen}
                    />

                    {/* sliding panel */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-hidden={!filtersOpen}
                        className={`absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-slate-900 dark:border-slate-700 border p-4 overflow-auto text-slate-900 dark:text-slate-100 shadow-xl transform transition-transform duration-200 ${filtersOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Filters</h2>
                            <button onClick={() => setFiltersOpen(false)} className="px-2 py-1 border rounded bg-white dark:bg-slate-800 text-sm dark:text-slate-100">Close</button>
                        </div>
                        <SearchFilters onChange={(f) => setFilters((s) => ({ ...s, ...f }))} />
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="hidden lg:block">
                            <SearchFilters onChange={(f) => setFilters((s) => ({ ...s, ...f }))} />
                        </div>
                        {/* Mobile drawer is rendered separately */}
                    </div>
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <PropertyGrid properties={properties} />
                        )}
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-2 border rounded">Prev</button>
                            <div>Page {page}</div>
                            <button onClick={() => setPage(page + 1)} className="px-3 py-2 border rounded">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
