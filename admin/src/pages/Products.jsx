import "./css/Products.css"
import ProductsList from "../components/productsList/ProductsList"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AllProducts } from "../service/OrderApi"
import { useProductContext } from "../context/ProductContext"

const Products = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const queryString = searchParams.toString();

    const { products, setProducts } = useProductContext();
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!searchParams.get("page") || !searchParams.get("limit")) {
            const nextParams = new URLSearchParams(searchParams)
            if (!nextParams.get('page')) nextParams.set('page', '1')
            if (!nextParams.get('limit')) nextParams.set('limit', '10')
            setSearchParams(nextParams, { replace: true })
            return;
        }

        let cancelled = false
        const loadProducts = async () => {
            setLoading(true)
            setError('')
            try {
                const { allProducts = [], pagination } = await AllProducts(queryString)
                if (cancelled) return
                setProducts(allProducts)
                setTotalPages(pagination?.totalPages || 1)
                setTotalProducts(pagination?.totalProduct ?? allProducts.length)
            } catch (requestError) {
                if (!cancelled) setError(requestError.response?.data?.message || 'Products could not be loaded.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadProducts()
        return () => { cancelled = true }
    }, [queryString, searchParams, setProducts, setSearchParams])

    const orderColumns = {
        first: "Product",
        second: "Category",
        third: "Price",
        fourth: "Stock",
        heading: "Products",
        fifth: "Status",
        grid: "50px 2fr 1.5fr 1fr 1fr 1fr",
        index: 0
    }
    return <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Catalogue</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Products</h2><p className="mt-1 text-sm text-slate-500">Manage inventory and product availability.</p></div>
            <Link to="/add-products" className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800 sm:self-auto"><i className="fa-solid fa-plus" /> Add product</Link>
        </div>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        {loading && <p className="text-xs text-slate-500">Loading products…</p>}
        <ProductsList orderColumns={orderColumns} products={products} totalPages={totalPages} totalProducts={totalProducts} />
    </section>
}

export default Products