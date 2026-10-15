import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Form from "../components/form/Form"
import { GetProduct } from "../service/OrderApi"

const EditProduct = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false
        GetProduct(id).then(result => {
            if (!result) throw new Error("Product not found.")
            if (!cancelled) setProduct(result)
        }).catch(requestError => {
            if (!cancelled) setError(requestError.response?.data?.message || requestError.message || "Product could not be loaded.")
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [id])

    return <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Catalogue</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Edit product</h2>
                <p className="mt-1 text-sm text-slate-500">Update product details, pricing, variants, and images.</p>
            </div>
            <Link to="/products" className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto">
                <i className="fa-solid fa-arrow-left" /> Back to products
            </Link>
        </div>
        {loading && <p className="text-sm text-slate-500">Loading product…</p>}
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        {product && <Form product={product} onSaved={() => navigate("/products")} />}
    </section>
}

export default EditProduct
