import React, { useEffect, useState } from "react";
import { useProductContext } from "../../context/ProductContext";
import { DeleteProduct, UpdateOrderPaymentStatus, UpdateOrderStatus } from "../../service/OrderApi";
import { useSearchParams } from "react-router-dom";
import "./ProductList.css"

const ProductsList = ({ orderColumns, products, orders, totalPages = 1, totalProducts = 0 }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const { setProducts } = useProductContext()
    const [modalOrderId, setModalOrderId] = useState(null);
    const [deleteProductId, setDeleteProductId] = useState(null)
    const [loadingId, setLoadingId] = useState(null);
    const [statusMap, setStatusMap] = useState({});
    const [paymentStatusMap, setPaymentStatusMap] = useState({});
    const [paymentRequestStatusMap, setPaymentRequestStatusMap] = useState({});
    const [actionError, setActionError] = useState('')
    const [actionMessage, setActionMessage] = useState('')
    const productMode = Array.isArray(products)

    useEffect(() => {
        setStatusMap({});
    }, [page]);

    const deleteProduct = async (id) => {
        setLoadingId(id)
        setActionError('')
        try {
            await DeleteProduct(id)
            setProducts(prev => prev.filter(product => product._id !== id))
            setActionMessage('Product deleted.')
            setDeleteProductId(null)
        } catch (error) {
            setActionError(error.response?.data?.message || 'Could not delete product.')
        } finally {
            setLoadingId(null)
        }
    }

    const changeParams = (type) => {
        if (type === "prev" && page > 1) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("page", String(page - 1));
            setSearchParams(newParams);
        }

        if (type === "next" && page < totalPages) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("page", String(page + 1));
            setSearchParams(newParams);
        }
    }

    const closeModal = () => setModalOrderId(null)

    const handleStatusChange = async (newStatus) => {
        const targetId = modalOrderId;
        if (!targetId) return
        setLoadingId(targetId);
        setActionError('')
        try {
            const data = await UpdateOrderStatus(targetId, newStatus);
            if (data.success) {
                setStatusMap(prev => ({ ...prev, [targetId]: newStatus }));
                setActionMessage(`Order marked ${newStatus.toLowerCase()}.`)
            }
        } catch (error) {
            setActionError(error.response?.data?.message || 'Could not update order status.')
        } finally {
            setLoadingId(null);
            closeModal();
        }
    }

    const handlePaymentStatusChange = async (orderId, newStatus) => {
        setLoadingId(orderId)
        setActionError('')
        try {
            const { order } = await UpdateOrderPaymentStatus(orderId, newStatus)
            setPaymentStatusMap(current => ({ ...current, [orderId]: order.paymentDetails.status }))
            setPaymentRequestStatusMap(current => ({ ...current, [orderId]: order.upiPaymentRequest.status }))
            setActionMessage(newStatus === 'PAID' ? 'UPI payment confirmed.' : 'UPI payment marked failed.')
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || 'Could not update payment status.')
        } finally {
            setLoadingId(null)
        }
    }

    const rows = productMode ? products : (orders || [])
    const start = totalProducts === 0 ? 0 : (page - 1) * limit + 1
    const end = Math.min((page - 1) * limit + rows.length, totalProducts)

    return (
        <>
            {(actionError || actionMessage) && <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${actionError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`} role={actionError ? 'alert' : 'status'}>
                <div className="flex items-center justify-between gap-3"><span>{actionError || actionMessage}</span><button className="font-semibold" onClick={() => { setActionError(''); setActionMessage('') }}>Dismiss</button></div>
            </div>}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div><h3 className="text-sm font-semibold text-slate-900">{orderColumns.heading || (productMode ? 'Products' : 'Orders')}</h3><p className="mt-1 text-[11px] text-slate-500">{totalProducts.toLocaleString('en-IN')} records</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">{totalProducts === 0 ? 'No records' : `${start}–${end} of ${totalProducts}`}</span>
                </div>

                {rows.length === 0 ? (
                    <div className="grid min-h-52 place-content-center justify-items-center px-5 text-center">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400"><i className={`fa-solid ${productMode ? 'fa-box-open' : 'fa-receipt'}`} /></span>
                        <p className="mt-3 text-sm font-semibold text-slate-800">No {productMode ? 'products' : 'orders'} found</p>
                        <p className="mt-1 text-xs text-slate-500">Try changing the search or check back later.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${productMode ? 'min-w-[760px]' : 'min-w-[980px]'} border-collapse text-left`}>
                            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                <tr>
                                    <th className="w-14 px-4 py-3 font-semibold">#</th>
                                    {productMode ? <>
                                        <th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Actions</th>
                                    </> : <>
                                        <th className="px-4 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Payment request</th><th className="px-4 py-3 font-semibold">Fulfillment</th><th className="px-4 py-3 font-semibold">Placed</th>
                                    </>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {productMode ? products.map((product, index) => (
                                    <tr key={product._id} className="hover:bg-slate-50/70">
                                        <td className="px-4 py-3.5 text-slate-400">{(page - 1) * limit + index + 1}</td>
                                        <td className="max-w-[290px] px-4 py-3.5"><div className="flex items-center gap-3"><img className="h-10 w-10 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain" src={product.detailUrl} alt="" /><span className="truncate font-semibold text-slate-800">{product.title?.shortTitle || 'Untitled product'}</span></div></td>
                                        <td className="px-4 py-3.5">{product.category || '—'}</td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-800">₹{Number(product.price?.cost || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3.5">{product.quantity ?? 0}</td>
                                        <td className="px-4 py-3.5"><button className="rounded-md border border-rose-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50" onClick={() => setDeleteProductId(product._id)} disabled={loadingId === product._id}>Delete</button></td>
                                    </tr>
                                )) : orders?.map((order, index) => {
                                    const displayStatus = statusMap[order._id] || order.status;
                                    const statusClass = displayStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : displayStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700';
                                    const paymentStatus = paymentStatusMap[order._id] || order.paymentDetails?.status || 'NOT REQUESTED';
                                    const paymentRequestStatus = paymentRequestStatusMap[order._id] || order.upiPaymentRequest?.status;
                                    const hasUpiRequest = Boolean(order.upiPaymentRequest?.requestedAt);
                                    return <tr key={order._id} className="hover:bg-slate-50/70">
                                        <td className="px-4 py-3.5 text-slate-400">{(page - 1) * limit + index + 1}</td>
                                        <td className="max-w-[180px] truncate px-4 py-3.5 font-mono text-[10px] text-slate-500">#{order._id}</td>
                                        <td className="px-4 py-3.5"><p className="font-semibold text-slate-800">{order.user?.name || 'Customer'}</p><p className="mt-1 text-[10px] text-slate-400">{order.user?.email || order.user?.mobile || ''}</p></td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-800">₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3.5">
                                            {hasUpiRequest ? <div className="min-w-[170px]">
                                                <p className="font-semibold text-slate-800">{order.upiPaymentRequest.label || order.upiPaymentRequest.provider}</p>
                                                <p className="mt-1 text-[10px] text-slate-500">{paymentStatus} · {(paymentRequestStatus || '').replaceAll('_', ' ')}</p>
                                                {!['PAID', 'FAILED'].includes(paymentStatus) && <div className="mt-2 flex gap-1.5">
                                                    <button className="rounded-md border border-emerald-200 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50" onClick={() => handlePaymentStatusChange(order._id, 'PAID')} disabled={loadingId === order._id}>Confirm</button>
                                                    <button className="rounded-md border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50" onClick={() => handlePaymentStatusChange(order._id, 'FAILED')} disabled={loadingId === order._id}>Reject</button>
                                                </div>}
                                            </div> : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5"><button className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${statusClass} disabled:cursor-default`} onClick={() => !['DELIVERED', 'REJECTED'].includes(displayStatus) && setModalOrderId(order._id)} disabled={['DELIVERED', 'REJECTED'].includes(displayStatus)}>{displayStatus}</button></td>
                                        <td className="px-4 py-3.5 text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5">
                    <p className="text-[11px] text-slate-500">Page {page} of {Math.max(totalPages, 1)}</p>
                    <div className="flex gap-2">
                        <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page" onClick={() => changeParams('prev')} disabled={page <= 1}><i className="fa-solid fa-chevron-left text-[10px]" /></button>
                        <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page" onClick={() => changeParams('next')} disabled={page >= totalPages}><i className="fa-solid fa-chevron-right text-[10px]" /></button>
                    </div>
                </div>
            </section>

            {(modalOrderId || deleteProductId) && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4" onClick={() => { closeModal(); setDeleteProductId(null) }}>
                <section className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
                    <h3 className="text-base font-semibold text-slate-900">{deleteProductId ? 'Delete product?' : 'Update order status'}</h3>
                    <p className="mt-1.5 text-sm text-slate-500">{deleteProductId ? 'This product will be removed from the catalogue.' : 'Choose the final status for this order.'}</p>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <button className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => { closeModal(); setDeleteProductId(null) }}>Cancel</button>
                        {modalOrderId && <><button className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700" onClick={() => handleStatusChange('DELIVERED')} disabled={loadingId === modalOrderId}>Mark delivered</button><button className="h-9 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700" onClick={() => handleStatusChange('REJECTED')} disabled={loadingId === modalOrderId}>Reject</button></>}
                        {deleteProductId && <button className="h-9 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700" onClick={() => deleteProduct(deleteProductId)} disabled={loadingId === deleteProductId}>{loadingId === deleteProductId ? 'Deleting…' : 'Delete product'}</button>}
                    </div>
                </section>
            </div>}
        </>
    )
}

export default ProductsList
