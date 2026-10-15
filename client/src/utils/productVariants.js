const defaultColors = [
    'Black', 'White', 'Blue', 'Red', 'Grey', 'Green',
    'Pink', 'Silver', 'Gold', 'Beige', 'Brown', 'Purple', 'Yellow',
]

const colorCategories = new Set([
    'fashion', 'fashion deals', 'mobiles', 'appliances', 'electronics',
    'smart gadgets', 'home', 'toys & baby care', 'sports & fitness',
    'auto accessories', 'furniture', 'bikes & scooters', 'sell old devices',
    'clothing', 'apparel', 'footwear', 'shoes', 'accessories',
])

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const footwearSizes = ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12']
const jeansSizes = ['28', '30', '32', '34', '36', '38']

export const getProductVariantOptions = (product) => {
    const category = String(product.category || '').trim().toLowerCase()
    const title = `${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`.toLowerCase()
    const variantType = String(product.variantType || '').toLowerCase()
    const isFashion = category === 'fashion' || category === 'fashion deals'
        || ['clothing', 'apparel', 'footwear', 'shoes', 'accessories'].includes(category)
    const isFootwear = variantType === 'footwear'
        || /footwear|shoe|sneaker|sandal|slipper/.test(category)
        || /shoe|sneaker|sandal|slipper/.test(title)
    const isJeans = /jean|trouser|pant/.test(title)
    const isApparel = isFashion || isJeans
        || /shirt|dress|t-shirt|sweatshirt|hoodie/.test(title)

    const sizes = Array.isArray(product.sizes) && product.sizes.length
        ? product.sizes
        : isFootwear
            ? footwearSizes
            : isJeans
                ? jeansSizes
                : variantType === 'accessories' || category === 'accessories'
                    ? ['One Size']
                    : isApparel
                        ? clothingSizes
                        : []
    const colors = Array.isArray(product.colors) && product.colors.length
        ? product.colors
        : colorCategories.has(category)
            ? defaultColors
            : []

    return { colors, sizes }
}
