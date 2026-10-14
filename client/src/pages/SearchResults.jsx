import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header/Header'
import { SearchProducts } from '../service/Api'
import './css/SearchResults.css'

const SearchResults = () => {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q')?.trim() || ''
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        if (!query) {
            setProducts([])
            setLoading(false)
            return undefined
        }

        setLoading(true)
        setError('')
        SearchProducts(query)
            .then(results => { if (!cancelled) setProducts(results) })
            .catch(requestError => {
                if (!cancelled) setError(requestError.response?.data?.message || 'Search is unavailable right now.')
            })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [query])

    return (
        <div className="search-results-page">
            <Header />
            <main className="search-results-content">
                <p className="search-results-eyebrow">Product search</p>
                <h1>Results for <span>“{query || 'all products'}”</span></h1>
                {!loading && !error && <p className="search-results-count">{products.length} {products.length === 1 ? 'product' : 'products'}</p>}
                {loading && <p className="search-results-state" role="status">Searching products…</p>}
                {error && <p className="search-results-state search-results-error" role="alert">{error}</p>}
                {!loading && !error && products.length === 0 && <p className="search-results-state">No matching products found. Try another search.</p>}
                {!loading && products.length > 0 && <div className="search-results-grid">
                    {products.map(product => (
                        <Link className="search-result-card" to={`/product/${product._id}`} key={product._id}>
                            <span className="search-result-image"><img src={product.detailUrl} alt={product.title?.shortTitle || 'Product'} loading="lazy" /></span>
                            <span className="search-result-copy">
                                <strong>{product.title?.shortTitle || 'Product'}</strong>
                                <span>{product.title?.longTitle}</span>
                                {product.averageRating > 0 && <small>{Number(product.averageRating).toFixed(1)} ★ · {product.numOfReviews || 0} reviews</small>}
                                <b>₹{Number(product.price?.cost || 0).toLocaleString('en-IN')}</b>
                            </span>
                        </Link>
                    ))}
                </div>}
            </main>
        </div>
    )
}

export default SearchResults
