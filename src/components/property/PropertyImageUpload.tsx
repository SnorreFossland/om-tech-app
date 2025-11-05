"use client"
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
// multipart upload no longer uses the RTK inline mutation

type SelectedFile = {
    file: File
    previewUrl: string
    id: string
}

export default function PropertyImageUpload({ propertyId, maxFiles = 20 }: { propertyId?: string; maxFiles?: number }) {
    const [files, setFiles] = useState<SelectedFile[]>([])
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState<number[]>([])

    function onFilesSelected(selected: FileList | null) {
        if (!selected) return
        const arr = Array.from(selected).slice(0, Math.max(0, maxFiles - files.length))
        const next = arr.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f), id: `${Date.now()}-${f.name}` }))
        setFiles((s) => {
            setProgress((p) => [...p, ...new Array(next.length).fill(0)])
            return [...s, ...next]
        })
    }

    function removeFile(id: string) {
        setFiles((s) => {
            const idx = s.findIndex((f) => f.id === id)
            const toRemove = s[idx]
            if (toRemove) URL.revokeObjectURL(toRemove.previewUrl)
            setProgress((p) => p.filter((_, i) => i !== idx))
            return s.filter((f) => f.id !== id)
        })
    }

    function moveUp(idx: number) {
        if (idx <= 0) return
        setFiles((s) => {
            const copy = [...s]
            const tmp = copy[idx - 1]
            copy[idx - 1] = copy[idx]
            copy[idx] = tmp
            setProgress((p) => {
                const pc = [...p]
                const tmpP = pc[idx - 1]
                pc[idx - 1] = pc[idx]
                pc[idx] = tmpP
                return pc
            })
            return copy
        })
    }

    function moveDown(idx: number) {
        setFiles((s) => {
            const copy = [...s]
            if (idx >= copy.length - 1) return copy
            const tmp = copy[idx + 1]
            copy[idx + 1] = copy[idx]
            copy[idx] = tmp
            setProgress((p) => {
                const pc = [...p]
                const tmpP = pc[idx + 1]
                pc[idx + 1] = pc[idx]
                pc[idx] = tmpP
                return pc
            })
            return copy
        })
    }

    // no-op: we no longer encode files to base64; we POST multipart/form-data

    async function uploadAll() {
        if (!propertyId) return
        if (files.length === 0) return
        setUploading(true)
        try {
            // upload files sequentially so we can track per-file progress
            for (let i = 0; i < files.length; i++) {
                const f = files[i]
                await new Promise<void>((resolve, reject) => {
                    const form = new FormData()
                    form.append('propertyId', propertyId as string)
                    form.append('files', f.file)
                    form.append('displayOrder', String(i))

                    const xhr = new XMLHttpRequest()
                    xhr.open('POST', '/api/properties/upload-multipart')
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const pct = Math.round((e.loaded / e.total) * 100)
                            setProgress((p) => {
                                const copy = [...p]
                                copy[i] = pct
                                return copy
                            })
                        }
                    }
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve()
                        else reject(new Error(`Upload failed: ${xhr.status}`))
                    }
                    xhr.onerror = () => reject(new Error('Upload request failed'))
                    xhr.send(form)
                })
            }

            // revoke object URLs to avoid memory leaks
            files.forEach((f) => URL.revokeObjectURL(f.previewUrl))
            setFiles([])
            setProgress([])
            window.alert('Upload successful')
        } catch (err: unknown) {
            console.error(err)
            const msg = err instanceof Error ? err.message : String(err)
            window.alert('Upload failed: ' + msg)
        } finally {
            setUploading(false)
        }
    }

    // cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            files.forEach((f) => URL.revokeObjectURL(f.previewUrl))
        }
    }, [files])

    return (
        <div className="space-y-3">
            <div>
                <label htmlFor="property-image-input" className="sr-only">Add property photos</label>
                <input id="property-image-input" ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e.target.files)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
                {files.map((f, i) => (
                    <div key={f.id} className="border rounded p-1 bg-white relative">
                        <div className="relative w-full h-32 rounded overflow-hidden">
                            <Image src={f.previewUrl} alt={f.file.name} fill className="object-cover" unoptimized />
                            {/* progress overlay */}
                            {progress[i] > 0 && progress[i] < 100 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">Uploading {progress[i]}%</div>
                                </div>
                            )}
                            {progress[i] === 100 && (
                                <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">Done</div>
                            )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="text-xs truncate" title={f.file.name}>{f.file.name}</div>
                            <div className="flex gap-1">
                                <button onClick={() => moveUp(i)} title="Move up" aria-label={`Move ${f.file.name} up`} className="px-2 py-1 border rounded text-xs">↑</button>
                                <button onClick={() => moveDown(i)} title="Move down" aria-label={`Move ${f.file.name} down`} className="px-2 py-1 border rounded text-xs">↓</button>
                                <button onClick={() => removeFile(f.id)} title="Remove" aria-label={`Remove ${f.file.name}`} className="px-2 py-1 border rounded text-xs text-red-600">✕</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <button onClick={() => inputRef.current?.click()} className="px-4 py-2 border rounded">Add photos</button>
                <button onClick={uploadAll} disabled={uploading || files.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
        </div>
    )
}
