import ProductsList from "../components/productsList/ProductsList"
import { useEffect, useState } from "react"
import { OrderList } from "../service/OrderApi"
import { Link, useSearchParams } from "react-router-dom"

const Orders = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const [order, setOrder] = useState([])
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
    const loadOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const { allOrders = [], totalPages: pages, totalOrders } = await OrderList(queryString)
        if (cancelled) return
        setOrder(allOrders)
        setTotalPages(pages || 1)
        setTotalProducts(totalOrders ?? allOrders.length)
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || 'Orders could not be loaded.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => { cancelled = true }

  }, [queryString, searchParams, setSearchParams])

  const orderColumns = {
    first: "Id",
    second: "Customer",
    third: "Amount",
    fourth: "Status",
    heading: "Orders",
    grid: "50px 2fr 1.5fr 1fr 1fr"
  }


  return <section className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Fulfillment</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Orders</h2><p className="mt-1 text-sm text-slate-500">Review orders and update fulfillment status.</p></div>
      <Link to="/orders" className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"><i className="fa-solid fa-rotate-right" /> Refresh</Link>
    </div>
    {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
    {loading && <p className="text-xs text-slate-500">Loading orders…</p>}
    <ProductsList orderColumns={orderColumns} orders={order} totalPages={totalPages} totalProducts={totalProducts} />
  </section>
}

export default Orders