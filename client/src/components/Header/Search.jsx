import React, { useEffect, useRef, useState } from 'react'
import "./Css/Search.css"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { fetchProducts } from '../../redux/features/ProductSlice'

const Search = ({ compact = false, placeholder = "Search products" }) => {

    const [text, setText] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const searchRef = useRef(null);

    const { products, productsLoaded, loadingProducts } = useSelector(state => state.products)

    useEffect(() => {
        if (!productsLoaded && !loadingProducts) dispatch(fetchProducts())
    }, [dispatch, loadingProducts, productsLoaded])

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setText("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };

    }, []);

    const changed = (e) => {
        setText(e.target.value)
    }

    const submitSearch = (event) => {
        event.preventDefault()
        const query = text.trim()
        if (!query) return
        navigate(`/search?q=${encodeURIComponent(query)}`)
    }

    const normalizedQuery = text.trim().toLowerCase()
    const matches = normalizedQuery
        ? products.filter(product => [
            product.title?.shortTitle,
            product.title?.longTitle,
            product.category
        ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery)).slice(0, 6)
        : []

    return (
        <div className={`searchbar${compact ? ' searchbar--compact' : ''}`} ref={searchRef}>
                <form className="searchbar-search" role="search" onSubmit={submitSearch}>
                    <button className="search-icon" type="submit" aria-label="Search products">
                        <i className="fa-solid fa-magnifying-glass" />
                    </button>
                    <input
                        type="text"
                        onChange={changed}
                        value={text}
                        placeholder={placeholder}
                        aria-label="Search products"
                    />
                </form>
                <div className="searchbar-list">
                    {normalizedQuery && <ul>
                        {matches.map(product => (
                            <li key={product._id}>
                                <Link className="search-link" onClick={() => setText("")} to={`/product/${product._id}`}>
                                    {product.title?.shortTitle || product.title?.longTitle || product.category}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link className="search-link search-all-link" onClick={submitSearch} to={`/search?q=${encodeURIComponent(text.trim())}`}>
                                {matches.length ? `See all results for “${text.trim()}”` : `Search for “${text.trim()}”`}
                            </Link>
                        </li>
                    </ul>}
                </div>
        </div>
    )
}

export default Search