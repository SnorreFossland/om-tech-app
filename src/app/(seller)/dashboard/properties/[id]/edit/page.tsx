"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PropertyForm from '@/components/property/PropertyForm'
import PropertyImageUpload from '@/components/property/PropertyImageUpload'
import { useGetPropertyQuery, useUpdatePropertyMutation } from '@/store/services/properties.api'

type Props = { params: { id: string } }

export default function EditPropertyPage({ params }: Props) {
    const { id } = params
    const { data, isLoading } = useGetPropertyQuery(id)
    const [updateProperty] = useUpdatePropertyMutation()
    const router = useRouter()

    if (isLoading) return <div>Loading...</div>
    const property = data?.data
    if (!property) return <div>Property not found</div>

    async function onSubmit(values: any) {
        try {
            await updateProperty({ id, data: values }).unwrap()
            alert('Updated')
            router.replace('/dashboard/properties')
        } catch (err) {
            console.error(err)
            alert('Update failed')
        }
    }

    // Map server fields to CreatePropertyInput shape where needed
    const defaultValues = {
        title: property.title || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        propertyType: (property.propertyType as any) || 'HOUSE',
        price: property.price || 0,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        squareFeet: property.squareFeet || undefined,
        description: property.description || undefined,
        amenities: property.amenities ? JSON.parse(property.amenities) : undefined,
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Edit Property</h1>
            <PropertyForm defaultValues={defaultValues} onSubmit={onSubmit} />
            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Photos</h2>
                <PropertyImageUpload propertyId={id} />
            </div>
        </div>
    )
}
