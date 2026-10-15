import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronLeft, ChevronRight, CircleCheck, MoreVertical, ThumbsDown, ThumbsUp } from 'lucide-react'
import { fetchProductDetail } from '../redux/features/ProductSlice'
import { useDataContextProvider } from '../context/DataProvider'
import { useAppBack } from '../hooks/useAppBack'
import './css/AllReviews.css'

const featureFilters = ['Overall', 'Colour', 'Comfort', 'Material Quality', 'Light Weight', 'True to Size']
const sortFilters = ['Most Helpful', 'Latest', 'Positive', 'Negative']

const AllReviews = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const goBack = useAppBack(`/product/${id}`)
    const dispatch = useDispatch()
    const { setReviewForm } = useDataContextProvider()
    const { product, loadingProduct } = useSelector(state => state.products)
    const [selectedFeature, setSelectedFeature] = useState('Overall')
    const [selectedSort, setSelectedSort] = useState('Most Helpful')
    const [helpfulVotes, setHelpfulVotes] = useState({})

    useEffect(() => {
        dispatch(fetchProductDetail(id))
    }, [dispatch, id])

    const savedReviews = Array.isArray(product?.reviews) ? product.reviews : []
    const reviews = savedReviews
    const ratingCounts = reviews.reduce((counts, review) => {
        const score = Math.round(Number(review.rating))
        if (score >= 1 && score <= 5) counts[score] += 1
        return counts
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    const averageRating = Number(product?.averageRating) || (reviews.length
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
        : 0)
    const totalRatings = Number(product?.numOfReviews ?? reviews.length)

    const visibleReviews = useMemo(() => {
        let results = [...reviews]
        if (selectedFeature !== 'Overall') {
            const filter = selectedFeature.toLowerCase()
            results = results.filter(review => {
                const features = Array.isArray(review.features) ? review.features.join(' ') : ''
                return `${features} ${review.title || ''} ${review.description || ''}`.toLowerCase().includes(filter)
            })
        }
        if (selectedSort === 'Positive') results.sort((first, second) => Number(second.rating) - Number(first.rating))
        if (selectedSort === 'Negative') results.sort((first, second) => Number(first.rating) - Number(second.rating))
        if (selectedSort === 'Latest') results.sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
        if (selectedSort === 'Most Helpful') results.sort((first, second) => Number(second.helpfulCount || 0) - Number(first.helpfulCount || 0))
        return results
    }, [reviews, selectedFeature, selectedSort])

    if (loadingProduct || product?._id !== id) {
        return <div className="all-reviews-loading"><span className="spinner-border text-dark" role="status" /></div>
    }

    const voteHelpful = (reviewKey, direction) => {
        setHelpfulVotes(current => ({
            ...current,
            [reviewKey]: current[reviewKey] === direction ? null : direction,
        }))
    }

    const writeReview = () => {
        setReviewForm(true)
        navigate(`/product/review/${id}`)
    }

    return (
        <main className="mobile-detail-page all-reviews-page">
            <header className="all-reviews-header">
                <button type="button" aria-label="Back to product" onClick={goBack}>
                    <ChevronLeft size={27} />
                </button>
                <h1>All Reviews</h1>
            </header>

            <nav className="review-filter-row" aria-label="Filter reviews by feature">
                {featureFilters.map(feature => (
                    <button
                        className={selectedFeature === feature ? 'selected' : ''}
                        type="button"
                        aria-pressed={selectedFeature === feature}
                        key={feature}
                        onClick={() => setSelectedFeature(feature)}
                    >{feature}</button>
                ))}
            </nav>

            <section className="ratings-breakdown" aria-label="Rating summary">
                <div className="rating-breakdown-score">
                    <div className="large-rating-stars" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                        {'★★★★★'.split('').map((star, index) => <span className={index < Math.round(averageRating) ? 'filled' : ''} key={index}>{star}</span>)}
                    </div>
                    <p>{totalRatings.toLocaleString('en-IN')} ratings and {reviews.length} reviews</p>
                </div>
                <div className="rating-breakdown-bars">
                    {[5, 4, 3, 2, 1].map(score => (
                        <div className="rating-breakdown-line" key={score}>
                            <span>{score} ★</span>
                            <div><i style={{ width: `${reviews.length ? ratingCounts[score] / Math.max(...Object.values(ratingCounts), 1) * 100 : 0}%` }} /></div>
                            <small>{ratingCounts[score].toLocaleString('en-IN')}</small>
                        </div>
                    ))}
                </div>
            </section>

            <section className="user-reviews-section">
                <h2>User reviews sorted by</h2>
                <nav className="review-sort-row" aria-label="Sort user reviews">
                    {sortFilters.map(sort => (
                        <button
                            className={selectedSort === sort ? 'selected' : ''}
                            type="button"
                            aria-pressed={selectedSort === sort}
                            key={sort}
                            onClick={() => setSelectedSort(sort)}
                        >{sort}</button>
                    ))}
                </nav>

                {visibleReviews.length ? <div className="all-review-list">
                    {visibleReviews.map((review, index) => {
                        const reviewKey = review._id || `${review.user || review.name || 'review'}-${index}`
                        const reviewPhotos = Array.isArray(review.images) ? review.images : Array.isArray(review.photos) ? review.photos : []
                        const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''

                        return <article className="all-review-card" key={reviewKey}>
                            <div className="all-review-rating-title">
                                <div className="all-review-stars">{'★'.repeat(Math.max(1, Math.min(5, Math.round(Number(review.rating) || 5))))}</div>
                                <strong>{Number(review.rating || 5).toFixed(1)}</strong>
                                <span className="review-title-dot">•</span>
                                <strong className="all-review-title">{review.title || 'Customer review'}</strong>
                            </div>
                            {(review.color || review.size) && <p className="review-variant-note">Review for: {review.color && `Color ${review.color}`}{review.color && review.size && ' • '}{review.size && `Size ${review.size}`}</p>}
                            <p className="all-review-description">{review.description}</p>
                            {reviewPhotos.length > 0 && <div className="review-photo-row">
                                {reviewPhotos.slice(0, 4).map((photo, photoIndex) => <img src={typeof photo === 'string' ? photo : photo.url} alt="Customer review" key={photo._id || photoIndex} />)}
                            </div>}
                            <p className="all-review-author">{review.name || 'Flipkart Customer'}{review.location && `, ${review.location}`}</p>
                            <div className="all-review-actions">
                                <button className={helpfulVotes[reviewKey] === 'up' ? 'voted' : ''} type="button" onClick={() => voteHelpful(reviewKey, 'up')}>
                                    <ThumbsUp size={16} /> Helpful for {Number(review.helpfulCount || 0) + (helpfulVotes[reviewKey] === 'up' ? 1 : 0)}
                                </button>
                                <button className={helpfulVotes[reviewKey] === 'down' ? 'voted' : ''} type="button" aria-label="Not helpful" onClick={() => voteHelpful(reviewKey, 'down')}><ThumbsDown size={16} /></button>
                                <button type="button" className="review-more-button" aria-label="More review actions"><MoreVertical size={17} /></button>
                            </div>
                            <div className="review-verification">{review.isAdmin ? 'Store review' : <><CircleCheck size={14} /> Verified Purchase</>}{reviewDate && ` · ${reviewDate}`}</div>
                        </article>
                    })}
                </div> : <div className="all-reviews-empty">
                    <p>{reviews.length ? `No reviews match “${selectedFeature}”.` : 'No written reviews yet.'}</p>
                    <button type="button" onClick={writeReview}>Write a review</button>
                </div>}
            </section>

        </main>
    )
}

export default AllReviews
