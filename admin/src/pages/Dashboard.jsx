import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AllProducts, OrderList } from '../service/OrderApi'

const currency = value => `₹${Number(value || 0).toLocaleString('en-IN')}`

const Dashboard = () => {
    const [data, setData] = useState({ products: [], orders: [], totalProducts: 0, totalOrders: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadDashboard = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [productResult, orderResult] = await Promise.all([
                AllProducts('page=1&limit=8'),
                OrderList('page=1&limit=50')
            ])
            setData({
                products: productResult.allProducts || [],
                orders: orderResult.allOrders || [],
                totalProducts: productResult.pagination?.totalProduct ?? productResult.allProducts?.length ?? 0,
                totalOrders: orderResult.totalOrders ?? orderResult.allOrders?.length ?? 0
            })
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Dashboard data could not be loaded. Check the API connection.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadDashboard() }, [loadDashboard])

    const pendingOrders = data.orders.filter(order => !['DELIVERED', 'REJECTED'].includes(order.status)).length
    const stats = [
        { label: 'Total products', value: data.totalProducts, icon: 'fa-box-open', tint: 'bg-blue-50 text-blue-700', note: 'In your catalogue' },
        { label: 'Total orders', value: data.totalOrders, icon: 'fa-receipt', tint: 'bg-violet-50 text-violet-700', note: 'All-time orders' },
        { label: 'Needs attention', value: pendingOrders, icon: 'fa-clock', tint: 'bg-amber-50 text-amber-700', note: 'Open in latest 50' },
    ]

    return (
        <div className="space-y-6">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Store overview</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Good day, Admin</h2>
                    <p className="mt-1 text-sm text-slate-500">Here’s what’s happening with your store.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadDashboard} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50" disabled={loading}>
                        <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <Link to="/add-products" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-800">
                        <i className="fa-solid fa-plus" /> Add product
                    </Link>
                </div>
            </section>

            {error && <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <span>{error}</span><button className="font-semibold underline" onClick={loadDashboard}>Try again</button>
            </div>}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map(stat => (
                    <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{loading ? '—' : stat.value.toLocaleString('en-IN')}</p>
                            </div>
                            <span className={`grid h-10 w-10 place-items-center rounded-lg ${stat.tint}`}><i className={`fa-solid ${stat.icon}`} /></span>
                        </div>
                        <p className="mt-3 text-[11px] text-slate-400">{stat.note}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div><h3 className="text-sm font-semibold text-slate-900">Recent orders</h3><p className="mt-1 text-[11px] text-slate-500">Latest activity from your store</p></div>
                        <Link to="/orders" className="text-xs font-semibold text-blue-700 hover:text-blue-900">View all</Link>
                    </div>
                    {loading ? <p className="p-5 text-sm text-slate-500">Loading orders…</p> : data.orders.length === 0 ? <p className="p-5 text-sm text-slate-500">No orders to show yet.</p> : (
                        <div className="divide-y divide-slate-100">
                            {data.orders.slice(0, 6).map(order => (
                                <div key={order._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_110px_100px]">
                                    <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{order.user?.name || 'Customer'}</p><p className="mt-1 truncate text-[10px] text-slate-400">#{order._id}</p></div>
                                    <span className={`hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : order.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{order.status}</span>
                                    <strong className="text-xs font-semibold text-slate-800">{currency(order.totalPrice)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div><h3 className="text-sm font-semibold text-slate-900">Catalogue snapshot</h3><p className="mt-1 text-[11px] text-slate-500">Recently added products</p></div>
                        <Link to="/products" className="text-xs font-semibold text-blue-700 hover:text-blue-900">Manage</Link>
                    </div>
                    {loading ? <p className="p-5 text-sm text-slate-500">Loading products…</p> : data.products.length === 0 ? <p className="p-5 text-sm text-slate-500">No products to show yet.</p> : (
                        <div className="divide-y divide-slate-100">
                            {data.products.slice(0, 5).map(product => (
                                <div key={product._id} className="flex items-center gap-3 px-5 py-3">
                                    <img className="h-10 w-10 rounded-lg border border-slate-100 bg-slate-50 object-contain" src={product.detailUrl} alt="" />
                                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{product.title?.shortTitle || 'Untitled product'}</p><p className="mt-1 truncate text-[10px] text-slate-400">{product.category || 'Uncategorised'}</p></div>
                                    <strong className="text-xs text-slate-800">{currency(product.price?.cost)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    )
}

export default Dashboard