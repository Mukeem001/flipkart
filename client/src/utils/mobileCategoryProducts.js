const categoryRules = {
    Fashion: {
        categories: ['Fashion', 'Fashion Deals'],
        title: /shirt|jean|dress|saree|kurta|shoe|footwear|fashion|apparel|t-shirt/i,
    },
    Mobiles: {
        categories: ['Mobiles'],
        title: /mobile|phone|smartphone|iphone/i,
    },
    Appliances: {
        categories: ['Appliances'],
        title: /appliance|washing machine|refrigerator|air fryer|mixer|fan/i,
    },
    Electronics: {
        categories: ['Electronics'],
        title: /electronics|earbud|headphone|speaker|camera|laptop|tablet/i,
    },
    'Smart Gadgets': {
        categories: ['Smart Gadgets'],
        title: /smart watch|smartwatch|fitness band|wearable|gadget/i,
    },
    Home: {
        categories: ['Home'],
        title: /home|kitchen|decor|lamp|bedsheet|curtain/i,
    },
    'Beauty & Personal Care': {
        categories: ['Beauty & Personal Care'],
        title: /beauty|skin|hair|makeup|personal care|grooming/i,
    },
    'Toys & Baby Care': {
        categories: ['Toys & Baby Care'],
        title: /toy|baby|kids|infant/i,
    },
    'Food & Healthcare': {
        categories: ['Food & Healthcare'],
        title: /food|grocery|health|supplement|healthcare/i,
    },
    'Sports & Fitness': {
        categories: ['Sports & Fitness'],
        title: /sport|fitness|gym|exercise|cricket|football/i,
    },
    'Auto Accessories': {
        categories: ['Auto Accessories'],
        title: /auto|car|bike accessory|vehicle/i,
    },
    'Pet Store': {
        categories: ['Pet Store'],
        title: /pet|dog|cat|aquarium/i,
    },
    Furniture: {
        categories: ['Furniture'],
        title: /furniture|chair|table|sofa|bed|cabinet/i,
    },
    'Books & Media': {
        categories: ['Books & Media'],
        title: /book|novel|media|music/i,
    },
    'Bikes & Scooters': {
        categories: ['Bikes & Scooters'],
        title: /bike|scooter|bicycle|cycle/i,
    },
    Travel: {
        categories: ['Travel'],
        title: /travel|luggage|suitcase|backpack/i,
    },
    'Top Deals': {
        categories: ['Top Deals'],
        title: /deal|offer|sale|discount/i,
    },
    'Gift Cards': {
        categories: ['Gift Cards'],
        title: /gift card|voucher/i,
    },
    'Sell Old Devices': {
        categories: ['Sell Old Devices'],
        title: /sell|exchange|refurbished|used device|old device/i,
    },
    'Software & Games': {
        categories: ['Software & Games'],
        title: /software|game|gaming|console/i,
    },
}

const getCategoryFallbackOffset = (category, productCount) => {
    const categoryHash = [...category].reduce((sum, character) => sum + character.charCodeAt(0), 0)
    return productCount ? categoryHash % productCount : 0
}

export const getMobileCategoryProducts = (products, category, limit = 12) => {
    if (category === 'For You') return products.slice(0, limit)

    const rule = categoryRules[category]
    if (!rule) return []

    const matches = products.filter(product => {
        const productCategory = String(product.category || '').trim().toLowerCase()
        const matchingCategory = rule.categories.some(value => value.toLowerCase() === productCategory)
        const title = `${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`
        return matchingCategory || rule.title.test(title)
    })

    if (matches.length) return matches.slice(0, limit)
    if (!products.length) return []

    const offset = getCategoryFallbackOffset(category, products.length)
    const rotatedProducts = [...products.slice(offset), ...products.slice(0, offset)]
    return rotatedProducts.slice(0, limit)
}

const promoCategories = {
    'Live now': 'Top Deals',
    'Discover Luxe': 'Fashion',
    'Value 365': 'Fashion',
    Flights: 'Travel',
    'Flipkart Minutes': 'Food & Healthcare',
    'Google Fitbit Air': 'Smart Gadgets',
    'iPhone 18 Pro': 'Mobiles',
    'Boat AirPods': 'Electronics',
    'Acer Iconia Tab': 'Electronics',
    'Noise Rep Fitness Band': 'Smart Gadgets',
    'Acer Air Fryers': 'Appliances',
    'Bolt Evo': 'Mobiles',
    'Bolt Ace 5G': 'Mobiles',
    'Claim Now': 'Top Deals',
    SuperCoin: 'Top Deals',
    'Join BL̄ACK': 'Fashion',
    'Bills & Recharges': 'Mobiles',
    'Flipkart Pay': 'Top Deals',
    'Flipkart Axis Bank Credit Card': 'Top Deals',
    Creatorhood: 'Fashion',
    'Personal Loan': 'Top Deals',
    'GenZ trends': 'Fashion',
    'Become a Seller': 'Top Deals',
}

export const getMobilePromoProducts = (products, promoName, limit = 12) => {
    const category = promoCategories[promoName]
    return category ? getMobileCategoryProducts(products, category, limit) : []
}
