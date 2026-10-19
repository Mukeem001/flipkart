const promoSlots = [
    {
        match: /shoe|sneaker|footwear/i,
        categories: ['Fashion', 'Fashion Deals'],
        label: 'Run into the weekend',
        offer: 'UP TO 40% OFF',
    },
    {
        match: /earbud|buds|headphone|headset/i,
        categories: ['Electronics', 'Smart Gadgets'],
        label: 'Sound for every day',
        offer: 'TOP PICKS',
    },
    {
        match: /backpack|travel bag|packing cube|travel/i,
        categories: ['Travel', 'Fashion'],
        label: 'Ready for the road',
        offer: 'SHOP NOW',
    },
]

export const getHomePromoProducts = (products) => {
    const selectedIds = new Set()

    return promoSlots.map(({ match, categories, label, offer }) => {
        const product = products.find(item =>
            !selectedIds.has(item._id) && match.test(item.title?.shortTitle || '')
        ) || products.find(item =>
            !selectedIds.has(item._id) && categories.includes(item.category)
        ) || products.find(item => !selectedIds.has(item._id))

        if (product) selectedIds.add(product._id)
        return { product, label, offer }
    }).filter(item => item.product)
}
