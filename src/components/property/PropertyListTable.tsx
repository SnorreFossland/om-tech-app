"use client"
import React from 'react'
import { useGetPropertiesQuery, useDeletePropertyMutation } from '@/store/services/properties.api'
import Link from 'next/link'

export default function PropertyListTable() {
    const { data, isLoading } = useGetPropertiesQuery({ pageSize: 100, owner: true })
    const [deleteProperty] = useDeletePropertyMutation()

    if (isLoading) return <div>Loading...</div>
    const properties = data?.data || []

    if (properties.length === 0) return <div className="p-4 border rounded bg-white">You have no properties yet.</div>

    return (
        <div className="overflow-auto bg-white border rounded">
            <table className="w-full table-fixed">
                <thead className="text-left">
                    <tr>
                        <th className="p-2">Title</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Created</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((p) => (
                        <tr key={p.id} className="border-t">
                            <td className="p-2">{p.title}</td>
                            <td className="p-2">{p.status || 'DRAFT'}</td>
                            <td className="p-2">{p.price ? `$${p.price}` : '-'}</td>
                            <td className="p-2">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                            <td className="p-2">
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/properties/${p.id}/edit`} className="px-2 py-1 border rounded text-sm">Edit</Link>
                                    <button onClick={() => { if (confirm('Delete property?')) deleteProperty(p.id) }} className="px-2 py-1 border rounded text-sm">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
