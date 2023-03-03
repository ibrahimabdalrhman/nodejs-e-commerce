const express = require("express");
const router = express.Router();
const path = require("path");
const rootDir = require("../util/path");
const { body} =require('express-validator')

const productsController = require("../controllers/products");
const cartController = require("../controllers/cart");
const isAuth=require('../middleware/isAuth')

// products

router.get("/products", productsController.getAllProducts);

router.get("/product/:id", productsController.getProductById);

router.post("/add-product",
    [
        body("title").isString().trim(),
        body("price").isFloat().trim(),
        body("description").trim(),
    ],
    isAuth,
    productsController.addProduct
);

router.get("/admin-products", isAuth, productsController.adminProducts);

router.patch(
    "/update-product/:id",
    [
        body("title").isString().trim(),
        body("price").isFloat().trim(),
        body("description").trim(),
    ],
    isAuth,
    productsController.updateProduct
);

// router.delete("/delete-product/:id", isAuth, productsController.deleteProduct);

// cart

router.get("/cart", isAuth, cartController.getCart);

router.post("/cart", isAuth, cartController.addToCart);

router.delete("/cart/:id", isAuth, cartController.deleteCart);

//checkout

router.get("/checkout", isAuth, cartController.getCheckout);

// order

router.get("/order", isAuth, cartController.getOrder);

router.post("/order", isAuth, cartController.postOrder);




module.exports = router;
