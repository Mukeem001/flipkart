import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'

const pageTitles = {
    '/': 'Overview',
    '/users': 'Users',
    '/products': 'Products',
    '/add-products': 'Add Product',
    '/orders': 'Orders',
    '/payment-settings': 'Payment Settings'
}

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const [search, setSearch] = useState('')
    const location = useLocation()
    const navigate = useNavigate()
    const title = location.pathname.startsWith('/edit-products')
        ? 'Edit Product'
        : pageTitles[location.pathname] || 'Admin'

    const submitSearch = (event) => {
        event.preventDefault()
        const value = search.trim()
        navigate(value ? `/products?search=${encodeURIComponent(value)}` : '/products')
        setSidebarOpen(false)
        setMobileSearchOpen(false)
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] text-[#182230]">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="min-h-screen lg:pl-[260px]">
                <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
                        <i className="fa-solid fa-bars" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:block">Store management</p>
                        <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
                    </div>
                    <form className="hidden w-full max-w-[360px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:bg-white md:flex" onSubmit={submitSearch} role="search">
                        <i className="fa-solid fa-magnifying-glass text-xs text-slate-400" aria-hidden="true" />
                        <input className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" />
                        <button className="text-[10px] font-semibold text-slate-400" type="submit">Enter</button>
                    </form>
                    <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden" onClick={() => setMobileSearchOpen(value => !value)} aria-label="Toggle search" aria-expanded={mobileSearchOpen}>
                        <i className="fa-solid fa-magnifying-glass" />
                    </button>
                    <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 sm:flex">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eaf0fb] text-xs font-bold text-[#1a477f]">AD</span>
                        <span className="hidden text-xs font-semibold text-slate-700 xl:block">Admin</span>
                    </div>
                </header>
                {mobileSearchOpen && <form className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden" onSubmit={submitSearch} role="search">
                    <i className="fa-solid fa-magnifying-glass text-xs text-slate-400" aria-hidden="true" />
                    <input className="h-9 min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" autoFocus />
                    <button className="text-xs font-semibold text-blue-700" type="submit">Search</button>
                </form>}
                <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout