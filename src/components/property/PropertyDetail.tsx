"use client"
import React, { useState } from 'react'
import PropertyGallery from './PropertyGallery'
import { useSession } from 'next-auth/react'
import { useAssignRepresentativeMutation, useUnassignRepresentativeMutation, useGetRepresentativesQuery } from '@/store/services/properties.api'
import { toast } from 'sonner'

type Photo = { url: string }

type Props = {
    property: {
        id: string
        title: string
        description?: string
        price?: number
        city?: string
        address?: string
        bedrooms?: number
        bathrooms?: number
        squareFeet?: number
        propertyType?: string
        photos?: Photo[]
        status?: string
        owner?: { id: string; email: string }
        representative?: { id: string; name?: string | null; email?: string }
    }
}

export default function PropertyDetail({ property }: Props) {
    const { data: session } = useSession()
    const [repId, setRepId] = useState('')
    const [assignRep, { isLoading: assigning }] = useAssignRepresentativeMutation()
    const [unassignRep, { isLoading: unassigning }] = useUnassignRepresentativeMutation()
    const { data: repsData } = useGetRepresentativesQuery()
    const reps = repsData?.data || []

    if (!property) return <div>Property not found</div>
    const isOwner = session?.user?.email && property.owner?.email === session.user.email

    return (
        <div className="space-y-6">
            <PropertyGallery photos={property.photos || []} />
            <div>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <div className="text-lg text-gray-700">${property.price?.toLocaleString()}</div>
                <div className="mt-4 text-gray-700">{property.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded">Bedrooms: {property.bedrooms}</div>
                <div className="p-4 border rounded">Bathrooms: {property.bathrooms}</div>
                <div className="p-4 border rounded">Square feet: {property.squareFeet}</div>
                <div className="p-4 border rounded">Type: {property.propertyType}</div>
            </div>

            {/* Representative assignment (owner-only) */}
            {isOwner && (
                <div className="mt-4 p-4 border rounded">
                    <h3 className="font-semibold mb-2">Representative</h3>
                    {property.representative ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{property.representative.name || property.representative.email}</div>
                                <div className="text-sm text-gray-600">{property.representative.email}</div>
                            </div>
                            <div>
                                <button disabled={unassigning} onClick={async () => {
                                    try {
                                        await unassignRep({ propertyId: property.id }).unwrap()
                                        toast.success('Representative unassigned')
                                    } catch (e) {
                                        toast.error('Failed to unassign representative')
                                    }
                                }} className="px-3 py-2 border rounded text-sm">Unassign</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <select value={repId} onChange={(e) => setRepId(e.target.value)} className="border p-2 rounded flex-1 bg-white dark:bg-slate-800">
                                <option value="">Select representative</option>
                                {reps.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name || r.email} — {r.email}</option>
                                ))}
                            </select>
                            <button disabled={assigning || !repId} onClick={async () => {
                                try {
                                    await assignRep({ propertyId: property.id, representativeId: repId }).unwrap()
                                    toast.success('Representative assigned')
                                    setRepId('')
                                } catch (e) {
                                    toast.error('Failed to assign representative')
                                }
                            }} className="px-3 py-2 border rounded text-sm">Assign</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
