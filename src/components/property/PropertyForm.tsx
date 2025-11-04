"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPropertySchema, CreatePropertyInput } from '@/lib/validations/property'

type Props = {
    defaultValues?: Partial<CreatePropertyInput>
    onSubmit: (data: CreatePropertyInput) => Promise<void> | void
}

export default function PropertyForm({ defaultValues, onSubmit }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePropertyInput>({
        resolver: zodResolver(createPropertySchema),
        defaultValues: defaultValues as any || { propertyType: 'HOUSE', price: 0 },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-slate-800 p-6 border rounded">
            <div>
                <label className="block text-sm">Title</label>
                <input {...register('title')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <label className="block text-sm">Address</label>
                <input {...register('address')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm">City</label>
                    <input {...register('city')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                    <label className="block text-sm">State</label>
                    <input {...register('state')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm">Zip</label>
                    <input {...register('zipCode')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                    <label className="block text-sm">Type</label>
                    <select {...register('propertyType')} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        <option value="HOUSE">House</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="CONDO">Condo</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-sm">Price</label>
                    <input type="number" {...register('price', { valueAsNumber: true })} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                    {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                    <label className="block text-sm">Bedrooms</label>
                    <input type="number" {...register('bedrooms', { valueAsNumber: true })} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                    <label className="block text-sm">Bathrooms</label>
                    <input type="number" step="0.5" {...register('bathrooms', { valueAsNumber: true })} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                </div>
            </div>

            <div>
                <label className="block text-sm">Square feet</label>
                <input type="number" {...register('squareFeet', { valueAsNumber: true })} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
            </div>

            <div>
                <label className="block text-sm">Description</label>
                <textarea {...register('description')} rows={4} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>

            <div>
                <label className="block text-sm">Amenities (comma separated)</label>
                <input {...register('amenities' as any)} className="mt-1 block w-full border rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" placeholder="e.g. Pool, Gym, Parking" />
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">{isSubmitting ? 'Creating...' : 'Create property'}</button>
            </div>
        </form>
    )
}
