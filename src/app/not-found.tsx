import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-xl text-center p-8 bg-white border rounded shadow">
                <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
                <p className="text-gray-600 mb-6">We couldn’t find the page you were looking for. It may have been removed or the link is incorrect.</p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/" className="px-4 py-2 border rounded">Home</Link>
                    <Link href="/properties" className="px-4 py-2 bg-blue-600 text-white rounded">Browse properties</Link>
                </div>
            </div>
        </div>
    )
}
