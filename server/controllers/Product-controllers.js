const Product = require("../models/product");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const cloudinary = require("../config/cloudinary")

module.exports.allProducts = wrapAsync(async (req, res) => {

    let filterQuery = {};
    let sortOption = {};

    const { rating, discount, arrivals, sort, page, limit, search } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    const shouldPaginate = page && limit;

    if (rating) {
        filterQuery.averageRating = { $gte: Number(rating) };
    }

    if (discount) {
        filterQuery["price.discount"] = { $gte: Number(discount) };
    }

    if (arrivals === "new") {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);
        filterQuery.createdAt = { $gte: recentDate };
    }

    if (arrivals === "old") {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);
        filterQuery.createdAt = { $lt: recentDate };
    }

    if (typeof search === "string" && search.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");
        filterQuery.$or = [
            { "title.shortTitle": searchRegex },
            { "title.longTitle": searchRegex },
            { category: searchRegex }
        ];
    }


    if (sort === "price_asc") {
        sortOption["price.cost"] = 1;
    }

    if (sort === "price_desc") {
        sortOption["price.cost"] = -1;
    }

    const totalProduct = await Product.countDocuments(filterQuery);

    let query = Product.find(filterQuery).sort(sortOption);

    if (shouldPaginate) {
        const skip = (currentPage - 1) * pageLimit;
        query = query.skip(skip).limit(pageLimit);
    }

    const allProducts = await query;

    res.status(200).json({
        message: "All products fetched", allProducts, pagination: shouldPaginate
            ? {
                currentPage,
                totalPages: Math.ceil(totalProduct / pageLimit),
                totalProduct,
                pageLimit
            }
            : null
    });

});


//Single Product Route
module.exports.product = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const singleProduct = await Product.findById(id)
    res.status(200).json({
        singleProduct
    })
})

// Add product
module.exports.AddProduct = wrapAsync(async (req, res) => {
    const { quantity, category, description, longtitle, shorttitle, mrp, cost, discount, emiAvailable } = req.body
    const detailUrl = req.file?.path || req.body.imageUrl?.trim();
    const publicId = req.file?.filename;

    if (!detailUrl) {
        return res.status(400).json({
            success: false,
            message: "Upload an image or provide an image URL"
        })
    }

    const product = new Product({
        detailUrl,
        publicId,
        title: {
            shortTitle: shorttitle,
            longTitle: longtitle
        },
        price: {
            mrp,
            cost,
            discount,
        },
        quantity,
        emiAvailable: emiAvailable === "true" || emiAvailable === true,
        category,
        description
    })
    await product.save()
    res.status(200).json({ message: "Product Added", product })
})

//Add Product Review
module.exports.ProdcutReview = wrapAsync(async (req, res) => {
    const { id } = req.params
    const { rating, title, description } = req.body
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) {
        return res.status(404).json({ success: false, message: "User Not Found" })
    }

    const product = await Product.findById(id)
    if (!product) {
        return res.status(404).json({ message: "Product Not found", success: false })
    }

    const alreadyReviewed = product.reviews.find(
        review => review.user.toString() === userId.toString()
    )

    if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: "Already Reviewed this Product" })
    }

    const review = {
        user: userId,
        name: user.name,
        title,
        description,
        rating: Number(rating)
    }
    product.reviews.push(review)

    product.numOfReviews = product.reviews.length

    const totalRating = product.reviews.reduce((acc, item) => acc + Number(item.rating), 0)
    product.averageRating = product.reviews.length
        ? Number((totalRating / product.reviews.length).toFixed(1))
        : 0

    await product.save()

    return res.status(201).json({
        success: true,
        message: "Review added successfully"
    })
})

// Update Review
module.exports.EditReview = wrapAsync(async (req, res) => {
    const { rating, title, description } = req.body
    const { id } = req.params
    const userId = req.user._id;

    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }

    const existingReview = existingProduct.reviews.find(review => review.user.toString() === userId.toString())
    if (!existingReview) {
        return res.status(404).json({
            success: false,
            message: "Review not found"
        })
    }

    existingReview.title = title
    existingReview.description = description
    existingReview.rating = Number(rating)

    existingProduct.numOfReviews = existingProduct.reviews.length
    const totalRating = existingProduct.reviews.reduce((acc, r) => acc + Number(r.rating), 0)
    existingProduct.averageRating = existingProduct.reviews.length
        ? Number((totalRating / existingProduct.reviews.length).toFixed(1))
        : 0

    await existingProduct.save()

    res.status(200).json({
        success: true,
        message: "Review updated successfully",
    })
})

//Delete Review Route
module.exports.DeleteReview = wrapAsync(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id;

    const product = await Product.findById(id)
    if (!product) {
        return res.status(404).json({ message: "product not found", success: false })
    }

    const review = product.reviews.find(review => review.user.toString() === userId.toString())
    if (!review) {
        return res.status(404).json({ message: "Review not found", success: false })
    }

    const reviews = product.reviews.filter(rev => rev.user.toString() !== userId.toString())

    product.reviews = reviews
    product.numOfReviews = reviews.length

    const totalRating = reviews.reduce((acc, r) => acc + Number(r.rating), 0)
    product.averageRating = reviews.length
        ? Number((totalRating / reviews.length).toFixed(1))
        : 0

    await product.save()

    res.status(200).json({ message: "Review Deleted", success: true })
})

module.exports.AdminAddProductReview = wrapAsync(async (req, res) => {
    const { id } = req.params
    const { rating, title, description, name } = req.body || {}
    const normalizedTitle = typeof title === "string" ? title.trim() : ""
    const normalizedDescription = typeof description === "string" ? description.trim() : ""
    const normalizedName = typeof name === "string" ? name.trim() : ""
    const numericRating = Number(rating)

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be a whole number from 1 to 5." })
    }
    if (!normalizedTitle || normalizedTitle.length > 120 || !normalizedDescription || normalizedDescription.length > 2000) {
        return res.status(400).json({ success: false, message: "Enter a title and review under 2000 characters." })
    }
    if (normalizedName.length > 80) {
        return res.status(400).json({ success: false, message: "Reviewer name must be under 80 characters." })
    }

    const [product, admin] = await Promise.all([
        Product.findById(id),
        User.findById(req.user._id).select("name role")
    ])
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." })
    }
    if (!admin || admin.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin account not found." })
    }

    product.reviews.push({
        user: admin._id,
        name: normalizedName || admin.name,
        title: normalizedTitle,
        description: normalizedDescription,
        rating: numericRating,
        isAdmin: true
    })
    product.numOfReviews = product.reviews.length
    product.averageRating = Number((product.reviews.reduce((total, review) => total + Number(review.rating), 0) / product.reviews.length).toFixed(1))
    await product.save()

    return res.status(201).json({
        success: true,
        message: "Admin review added.",
        review: product.reviews[product.reviews.length - 1],
        averageRating: product.averageRating,
        numOfReviews: product.numOfReviews
    })
})


// Delete Product route
module.exports.DeleteProduct = wrapAsync(async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id);

    if(!product){
       return res.status(404).json({message: "product Not Found"})
    }

    if(product.publicId){
        await cloudinary.uploader.destroy(product.publicId);
    } 
    await product.deleteOne();

    res.status(200).json({ message: "Product Deleted", product })
})