import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminUserList, DeleteUser, ToggleUserRole } from '../service/OrderApi'

const Users = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page') || 1)
    const search = searchParams.get('search') || ''
    const [users, setUsers] = useState([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loadedRequest, setLoadedRequest] = useState('')
    const [error, setError] = useState('')
    const [searchInput, setSearchInput] = useState(search)
    const requestKey = `${page}:${search}`
    const loading = loadedRequest !== requestKey

    useEffect(() => {
        let cancelled = false
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (search) params.set('search', search)
        AdminUserList(params.toString())
            .then(data => {
                if (cancelled) return
                setUsers(data.users || [])
                setTotalUsers(data.totalUsers || 0)
                setTotalPages(data.totalPages || 1)
                setLoadedRequest(requestKey)
            })
            .catch(requestError => {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || 'Users could not be loaded.')
                    setLoadedRequest(requestKey)
                }
            })
        return () => { cancelled = true }
    }, [page, search, requestKey])

    const handleRoleToggle = async (user) => {
        if (user.role === 'admin') {
            setError('Admin accounts cannot be edited from this page.')
            return
        }

        const nextRole = user.role === 'seller' ? 'customer' : 'seller'
        try {
            await ToggleUserRole(user._id, nextRole)
            setUsers(current => current.map(item => item._id === user._id ? { ...item, role: nextRole } : item))
            setError('')
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not update user role.')
        }
    }

    const handleDeleteUser = async (user) => {
        if (user.role === 'admin') {
            setError('Admin accounts cannot be deleted.')
            return
        }

        const confirmed = window.confirm(`Delete ${user.name || 'this user'}? This action cannot be undone.`)
        if (!confirmed) return

        try {
            await DeleteUser(user._id)
            setUsers(current => current.filter(item => item._id !== user._id))
            setTotalUsers(current => Math.max(current - 1, 0))
            setError('')
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not delete user.')
        }
    }

    const submitSearch = event => {
        event.preventDefault()
        setError('')
        const next = new URLSearchParams(searchParams)
        if (searchInput.trim()) next.set('search', searchInput.trim())
        else next.delete('search')
        next.set('page', '1')
        setSearchParams(next)
    }

    const changePage = nextPage => {
        const next = new URLSearchParams(searchParams)
        next.set('page', String(nextPage))
        setSearchParams(next)
    }

    return <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Customer directory</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Users</h2><p className="mt-1 text-sm text-slate-500">Browse registered customer accounts and contact details.</p></div>
            <Link to="/" className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"><i className="fa-solid fa-chart-pie" /> Overview</Link>
        </div>

        {error && <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert"><span>{error}</span></div>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div><h3 className="text-sm font-semibold text-slate-900">Registered users</h3><p className="mt-1 text-[11px] text-slate-500">{totalUsers.toLocaleString('en-IN')} accounts</p></div>
                <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
                    <input className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 sm:w-64" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search name, email, phone…" aria-label="Search users" />
                    <button className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700">Search</button>
                </form>
            </div>

            {loading ? <p className="p-5 text-sm text-slate-500">Loading users…</p> : users.length === 0 ? <div className="grid min-h-48 place-content-center justify-items-center px-5 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400"><i className="fa-solid fa-users" /></span>
                <p className="mt-3 text-sm font-semibold text-slate-800">No users found</p>
                <p className="mt-1 text-xs text-slate-500">Try another search or check back later.</p>
            </div> : <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Username</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {users.map(user => <tr key={user._id} className="hover:bg-slate-50/70">
                            <td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{user.name?.slice(0, 1)?.toUpperCase() || 'U'}</span><span className="min-w-0"><strong className="block truncate text-slate-800">{user.name}</strong><span className="mt-1 block truncate text-[10px] text-slate-400">{user.email}</span></span></div></td>
                            <td className="px-5 py-3.5">{user.phone || '—'}</td><td className="px-5 py-3.5">{user.username || '—'}</td>
                            <td className="px-5 py-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">{user.role || 'customer'}</span></td>
                            <td className="px-5 py-3.5">{user.orderCount || 0}</td>
                            <td className="px-5 py-3.5 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                            <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-2">
                                    <button type="button" title={user.role === 'admin' ? 'Admin role cannot be changed' : 'Edit role'} onClick={() => handleRoleToggle(user)} disabled={user.role === 'admin'} className="grid h-8 w-8 place-items-center rounded-md border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-pen-to-square text-[12px]" /></button>
                                    <button type="button" title={user.role === 'admin' ? 'Admin account cannot be deleted' : 'Delete user'} onClick={() => handleDeleteUser(user)} disabled={user.role === 'admin'} className="grid h-8 w-8 place-items-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"><i className="fa-solid fa-trash text-[12px]" /></button>
                                </div>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>}

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5"><span className="text-[11px] text-slate-500">Page {page} of {totalPages}</span><div className="flex gap-2"><button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40" onClick={() => changePage(page - 1)} disabled={page <= 1} aria-label="Previous page"><i className="fa-solid fa-chevron-left text-[10px]" /></button><button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40" onClick={() => changePage(page + 1)} disabled={page >= totalPages} aria-label="Next page"><i className="fa-solid fa-chevron-right text-[10px]" /></button></div></div>
        </section>
    </section>
}

export default Users