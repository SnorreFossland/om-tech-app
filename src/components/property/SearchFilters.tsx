"use client"
import React from 'react'

type Props = {
    propertyType?: string
    onChange?: (filters: Record<string, any>) => void
}

export default function SearchFilters({ propertyType, onChange }: Props) {
    return (
        <div className="p-4 border rounded bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm">Property type</label>
                    <select
                        defaultValue={propertyType}
                        className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        onChange={(e) => onChange?.({ propertyType: e.target.value })}
                    >
                        <option value="">Any</option>
                        <option value="HOUSE">House</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="CONDO">Condo</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm">Bedrooms</label>
                    <select className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100" onChange={(e) => onChange?.({ bedrooms: parseInt(e.target.value || '0', 10) || undefined })}>
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm">Min price</label>
                    <input type="number" className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100" onChange={(e) => onChange?.({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div>
                    <label className="block text-sm">Max price</label>
                    <input type="number" className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100" onChange={(e) => onChange?.({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
            </div>
        </div>
    )
}
