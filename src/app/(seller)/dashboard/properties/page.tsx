"use client"
import React from 'react'
import Link from 'next/link'
import PropertyListTable from '@/components/property/PropertyListTable'

export default function ManagePropertiesPage() {
    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Properties</h1>
                <Link href="/seller/dashboard/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add New Property</Link>
            </div>

            <PropertyListTable />
        </div>
    )
}
