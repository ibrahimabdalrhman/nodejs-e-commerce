const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const authController = require("../controllers/auth");
const shopCartController = require("../controllers/shopCart");

router.get("/", shopController.home);
router.get("/home", shopController.home);
router.get("/products", shopController.products);
router.get("/favourites", shopController.favourites);
router.post("/addFav", shopController.addFav);
router.get("/Orders", shopController.Orders);
router.get("/admin", shopController.admin);
router.post("/update-product", shopController.getUpdateProduct);
router.post("/submit-updated", shopController.postUpdateProduct);
router.post("/delete-product/:id", shopController.deleteProduct);
router.get("/new-product", shopController.newProduct);
router.post("/new-product", shopController.postNewProduct);

router.post("/product", shopController.productById);

//cart
router.get("/cart", shopCartController.getCart);
router.post("/cart",  shopCartController.addToCart);
router.delete("/cart/:id",  shopCartController.deleteCart);




module.exports = router;
