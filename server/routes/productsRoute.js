const express = require("express")
const router = express.Router();

const { allProducts, product, AddProduct, DeleteProduct, ProdcutReview, EditReview, DeleteReview } = require("../controllers/Product-controllers");
const auth = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");
const upload  = require("../middlewares/multer");
const { AdminAddProductReview } = require("../controllers/Product-controllers");

//All Products
router.get("/allproducts", allProducts)

//Single Products
router.get("/product/:id", product)

//Delete product
router.delete("/deleteproduct/:id", DeleteProduct)

//Add Product
router.post("/addproduct", adminAuth, upload.single("image"), AddProduct)

//Add Product Review
router.post("/review/:id",auth, ProdcutReview)

//Update Product Review
router.post("/review/update/:id",auth, EditReview)

//Delete Product Review
router.post("/review/delete/:id",auth, DeleteReview)

//Add a store review from the admin panel
router.post("/admin/products/:id/reviews", adminAuth, AdminAddProductReview)

module.exports = router