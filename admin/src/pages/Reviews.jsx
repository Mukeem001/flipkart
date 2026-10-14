import { useEffect, useMemo, useState } from 'react'
import { AddAdminProductReview, AllProducts } from '../service/OrderApi'

const Reviews = () => {
    const [products, setProducts] = useState([])
    const [productId, setProductId] = useState('')
    const [review, setReview] = useState({ name: '', rating: '5', title: '', description: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const selectedProduct = useMemo(() => products.find(product => product._id === productId), [productId, products])

    useEffect(() => {
        let cancelled = false
        AllProducts('page=1&limit=100')
            .then(({ allProducts = [] }) => {
                if (cancelled) return
                setProducts(allProducts)
                setProductId(allProducts[0]?._id || '')
            })
            .catch(requestError => {
                if (!cancelled) setError(requestError.response?.data?.message || 'Products could not be loaded.')
            })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const updateReview = (field, value) => setReview(current => ({ ...current, [field]: value }))

    const submitReview = async event => {
        event.preventDefault()
        if (!productId) return
        setSaving(true)
        setError('')
        setMessage('')
        try {
            const result = await AddAdminProductReview(productId, review)
            setProducts(current => current.map(product => product._id === productId ? {
                ...product,
                reviews: [...(product.reviews || []), result.review],
                averageRating: result.averageRating,
                numOfReviews: result.numOfReviews
            } : product))
            setReview(current => ({ ...current, title: '', description: '' }))
            setMessage('Review added to the product.')
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Review could not be added.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-5">
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Catalogue</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Product reviews</h2>
                <p className="mt-1 text-sm text-slate-500">Add a store review to a product. Ratings update with the review.</p>
            </header>

            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
            {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
                <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]" onSubmit={submitReview}>
                    <h3 className="text-sm font-semibold text-slate-900">New review</h3>
                    <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                        Product
                        <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={productId} onChange={event => setProductId(event.target.value)} disabled={loading || !products.length} required>
                            {loading && <option value="">Loading products…</option>}
                            {!loading && !products.length && <option value="">No products available</option>}
                            {products.map(product => <option value={product._id} key={product._id}>{product.title?.shortTitle || product.title?.longTitle}</option>)}
                        </select>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                            Reviewer name
                            <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" value={review.name} onChange={event => updateReview('name', event.target.value)} placeholder="Flipkart Admin" maxLength={80} />
                        </label>
                        <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                            Rating
                            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={review.rating} onChange={event => updateReview('rating', event.target.value)}>
                                {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} stars</option>)}
                            </select>
                        </label>
                    </div>
                    <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                        Review title
                        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" value={review.title} onChange={event => updateReview('title', event.target.value)} required maxLength={120} />
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                        Review
                        <textarea className="min-h-32 resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" value={review.description} onChange={event => updateReview('description', event.target.value)} required maxLength={2000} />
                    </label>
                    <button className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={saving || loading || !productId}>{saving ? 'Adding…' : 'Add review'}</button>
                </form>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">Selected product</p>
                            <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">{selectedProduct?.title?.shortTitle || 'Choose a product'}</h3>
                        </div>
                        {selectedProduct && <div className="shrink-0 text-right"><strong className="text-lg text-slate-900">{Number(selectedProduct.averageRating || 0).toFixed(1)} ★</strong><p className="text-[11px] text-slate-500">{selectedProduct.numOfReviews || 0} reviews</p></div>}
                    </div>
                    <div className="mt-4 space-y-3">
                        {(selectedProduct?.reviews || []).length ? selectedProduct.reviews.map(item => (
                            <article className="border-b border-slate-100 pb-3 last:border-0" key={item._id}>
                                <div className="flex items-baseline gap-2"><strong className="text-xs text-emerald-700">{item.rating} ★</strong><h4 className="text-sm font-semibold text-slate-800">{item.title}</h4></div>
                                <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                                <p className="mt-1 text-[10px] text-slate-400">{item.name}{item.isAdmin ? ' · Store review' : ''}</p>
                            </article>
                        )) : <p className="py-5 text-sm text-slate-500">No reviews saved for this product yet.</p>}
                    </div>
                </section>
            </section>
        </div>
    )
}

export default Reviews
