"use client"
import React from 'react'
import PropertyCard from './PropertyCard'

type Property = any

type Props = {
    properties: Property[]
}

export default function PropertyGrid({ properties }: Props) {
    if (!properties || properties.length === 0) {
        return <div className="text-center py-8 text-gray-500">No properties found.</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p: any) => (
                <PropertyCard key={p.id} id={p.id} title={p.title} price={p.price} city={p.city} bedrooms={p.bedrooms} bathrooms={p.bathrooms} squareFeet={p.squareFeet} propertyType={p.propertyType} photos={p.photos} status={p.status} />
            ))}
        </div>
    )
}
