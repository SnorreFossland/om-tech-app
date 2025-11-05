"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBlurDataUrl } from '@/lib/image/placeholder'

type Photo = { url: string }

type Props = {
    id: string
    title: string
    price: number
    city: string
    bedrooms?: number
    bathrooms?: number
    squareFeet?: number
    propertyType?: string
    status?: string
    photos?: Photo[]
}

export default function PropertyCard({ id, title, price, city, bedrooms, bathrooms, squareFeet, propertyType, photos, status }: Props) {
    const img = photos && photos.length ? photos[0].url : 'https://placehold.co/400x300'
    const [imgLoaded, setImgLoaded] = useState(false)

    return (
        <Link href={`/properties/${id}`} className="block" aria-label={`View ${title}`}>
            <article className="border rounded overflow-hidden bg-white hover:shadow-lg transition">
                <div className="h-48 bg-gray-100 relative">
                    {/* skeleton placeholder shown until image loads */}
                    {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                    <Image
                        src={img}
                        alt={title}
                        fill
                        className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        unoptimized
                        placeholder="blur"
                        blurDataURL={getBlurDataUrl()}
                        onLoad={() => setImgLoaded(true)}
                    />
                </div>
                <div className="p-3">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <div className="text-sm text-gray-600">{city} • {propertyType}</div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="text-lg font-bold">${price?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{bedrooms} bd • {bathrooms} ba • {squareFeet} sqft</div>
                    </div>
                    {status === 'SOLD' && <div className="mt-2 inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">SOLD</div>}
                </div>
            </article>
        </Link>
    )
}
