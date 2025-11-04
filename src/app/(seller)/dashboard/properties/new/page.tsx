"use client"
import React, { useState } from 'react'
import PropertyImageUpload from '@/components/property/PropertyImageUpload'
import PropertyForm from '@/components/property/PropertyForm'
import { useCreatePropertyMutation } from '@/store/services/properties.api'

export default function NewPropertyPage() {
    const [creating, setCreating] = useState(false)
    const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null)
    const [createProperty] = useCreatePropertyMutation()

    async function onSubmit(data: any) {
        setCreating(true)
        try {
            // amenities may be provided as comma-separated string from the simple form
            const amenitiesField = (data as any).amenities
            const amenities = typeof amenitiesField === 'string' ? amenitiesField.split(',').map((s: string) => s.trim()).filter(Boolean) : data.amenities

            const payload = {
                ...data,
                amenities,
            }

            const res = await createProperty(payload as any).unwrap()
            setCreatedPropertyId(res.data.id)
        } catch (err) {
            console.error(err)
            alert('Create failed')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">List a New Property</h1>

            {!createdPropertyId ? (
                <PropertyForm onSubmit={onSubmit} />
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border rounded">Property created. Now upload photos.</div>
                    <PropertyImageUpload propertyId={createdPropertyId} />
                </div>
            )}
        </div>
    )
}
