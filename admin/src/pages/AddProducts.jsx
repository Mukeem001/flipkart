import Form from '../components/form/Form'
import { Link } from 'react-router-dom'

const AddProducts = () => {
    return <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Catalogue</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Add product</h2><p className="mt-1 text-sm text-slate-500">Create a catalogue listing with images, pricing, and stock.</p></div>
            <Link to="/products" className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"><i className="fa-solid fa-arrow-left" /> Back to products</Link>
        </div>
        <Form />
    </section>
}

export default AddProducts