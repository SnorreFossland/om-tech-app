"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { getBlurDataUrl } from '@/lib/image/placeholder'

type Photo = { url: string }

export default function PropertyGallery({ photos }: { photos: Photo[] }) {
    const [mainLoaded, setMainLoaded] = useState(false)
    const [thumbsLoaded, setThumbsLoaded] = useState<boolean[]>(() => new Array(Math.min(photos?.length || 0, 5)).fill(false))

    if (!photos || photos.length === 0) {
        return <div className="h-64 bg-gray-100 flex items-center justify-center">No photos</div>
    }

    return (
        <div className="space-y-2">
            <div className="h-64 bg-gray-100 overflow-hidden rounded relative">
                {!mainLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                <Image src={photos[0].url} alt="property photo" fill className={`object-cover transition-opacity duration-300 ${mainLoaded ? 'opacity-100' : 'opacity-0'}`} unoptimized placeholder="blur" blurDataURL={getBlurDataUrl()} onLoad={() => setMainLoaded(true)} />
            </div>
            <div className="flex gap-2">
                {photos.slice(0, 5).map((p, i) => (
                    <div key={i} className="w-20 h-14 relative rounded overflow-hidden">
                        {!thumbsLoaded[i] && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                        <Image src={p.url} alt={`thumb-${i}`} fill className={`object-cover transition-opacity duration-200 ${thumbsLoaded[i] ? 'opacity-100' : 'opacity-0'}`} unoptimized placeholder="blur" blurDataURL={getBlurDataUrl()} onLoad={() => setThumbsLoaded((s) => {
                            const copy = [...s]
                            copy[i] = true
                            return copy
                        })} />
                    </div>
                ))}
            </div>
        </div>
    )
}
