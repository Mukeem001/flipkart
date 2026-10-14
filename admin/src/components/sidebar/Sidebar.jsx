import { NavLink, useNavigate } from "react-router-dom"

const navigation = [
    { label: 'Overview', path: '/', icon: 'fa-chart-pie', end: true },
    { label: 'Users', path: '/users', icon: 'fa-users' },
    { label: 'Products', path: '/products', icon: 'fa-box-open' },
    { label: 'Add Product', path: '/add-products', icon: 'fa-circle-plus' },
    { label: 'Orders', path: '/orders', icon: 'fa-receipt' },
    { label: 'Reviews', path: '/reviews', icon: 'fa-star' },
    { label: 'Payment Settings', path: '/payment-settings', icon: 'fa-wallet' },
]

const Sidebar = ({ open, onClose }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/login', { replace: true })
        if (onClose) onClose()
    }

    return (
        <>
            {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={onClose} />}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#10213b] text-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffdc00] text-lg font-black text-[#10213b]">F</div>
                    <div>
                        <p className="text-sm font-semibold tracking-wide">FLIPKART</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Commerce admin</p>
                    </div>
                    <button className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close navigation">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div className="px-4 pt-7">
                    <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Workspace</p>
                    <nav className="grid gap-1.5" aria-label="Admin navigation">
                        {navigation.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={onClose}
                                className={({ isActive }) => `flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${isActive ? 'bg-[#21416c] text-white shadow-sm' : 'text-slate-300 hover:bg-white/7 hover:text-white'}`}
                            >
                                <i className={`fa-solid ${item.icon} w-5 text-center text-sm`} aria-hidden="true" />
                                <span>{item.label}</span>
                                {item.label === 'Orders' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" title="Orders" />}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto border-t border-white/10 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#25466f] text-xs font-bold">AD</div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">Administrator</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">Store operations</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                        <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar