export const createDemoReviews = (product) => {
    const productImage = product?.detailUrl
    const isFootwear = /shoe|sneaker|footwear/i.test(`${product?.category || ''} ${product?.title?.shortTitle || ''}`)
    const reviewSamples = [
        { rating: 5, title: 'Fabulous!', description: 'Looks cool, comfortable to wear. Value for money.', name: 'Demo Buyer 1', location: 'Moradabad', helpfulCount: 5, color: 'White/Black', size: '5', features: ['Colour', 'Comfort', 'Material Quality'] },
        { rating: 5, title: 'Must buy!', description: 'Great quality and a comfortable fit. Happy with this purchase.', name: 'Demo Buyer 2', location: 'Delhi', helpfulCount: 4, color: 'White', size: '6', features: ['Comfort', 'Material Quality'] },
        { rating: 4, title: 'Good choice', description: 'Good for everyday use and looks just like the pictures.', name: 'Demo Buyer 3', location: 'Noida', helpfulCount: 3, color: 'White/Grey', size: '7', features: ['Colour', 'Light Weight'] },
        { rating: 4, title: 'Worth the price', description: 'Lightweight and stylish. The fit is comfortable for long walks.', name: 'Demo Buyer 4', location: 'Lucknow', helpfulCount: 2, color: 'White/Blue', size: '4', features: ['Comfort', 'Light Weight', 'True to Size'] },
        { rating: 5, title: 'Really comfortable', description: 'Nice design, good finish, and a great value for money.', name: 'Demo Buyer 5', location: 'Jaipur', helpfulCount: 1, color: 'White/Black', size: '5', features: ['Colour', 'Material Quality', 'True to Size'] },
    ]

    return reviewSamples.map((review, index) => ({
        ...review,
        _id: `demo-review-${index + 1}`,
        isDemo: true,
        createdAt: new Date(Date.now() - (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        images: productImage ? [productImage] : [],
        color: isFootwear ? review.color : undefined,
        size: isFootwear ? review.size : undefined,
    }))
}