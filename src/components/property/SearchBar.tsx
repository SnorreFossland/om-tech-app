"use client"
import React, { useState } from 'react'

type Props = {
    initialCity?: string
    onSearch?: (city: string) => void
}

export default function SearchBar({ initialCity = '', onSearch }: Props) {
    const [city, setCity] = useState(initialCity)

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault()
        onSearch?.(city)
    }

    return (
        <form onSubmit={submit} className="w-full flex gap-2 items-center">
            <input
                aria-label="Search by city"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Search by city or neighborhood"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Search
            </button>
        </form>
    )
}
