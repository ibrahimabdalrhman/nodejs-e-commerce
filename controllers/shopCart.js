const Product = require('../models/product');
const Order = require("../models/order");
const stripe = require("stripe")(
    "sk_test_51Me28BH1n7EX55b0No94ytQvxO3vuGqlg4pydvZoBvVNMh6rSqehYCRbpwmrCPEXZ72VfhFnW2o8D4RFd501bb7q00uv9H8Uiu"
);

exports.addToCart =async (req, res, next) => {
    const Quantity = req.body.Quantity;
    const id = req.body.id;
    const product = await Product.findById(id);

    // console.log(Quantity);
    // console.log(id);
    // console.log(product);
    const addedToCart = await req.user.addQuantityToCart(product, Quantity);
    res.redirect('/cart');
    
}

exports.getCart = async (req, res, next) => {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    console.log("---------------->>>", products);
    let totalSum = 0;
    products.forEach(element => {
        totalSum += element.quantity * element.productId.price;
    });
    res.render("cart", {
        products: products,
        totalSum: totalSum,
        user: req.user,
        isLoggedin: req.session.isloggedin,
    });
};

exports.deleteCart = (req, res, next) => {
    const prodId = req.params.id;
    Product.findById(prodId)
        .then((product) => {
            return req.user.deleteItemFromCart(product);
        })
        .then(
            res.json({
                message: "deleted item from cart",
            })
        )
        .catch((err) => {
            console.log(err);
        });
};


exports.getCheckout =async (req, res, next) => {
    let products;
    let totalSum = 0;
    try {
        const user = await req.user
            .populate("cart.items.productId");
        products = user.cart.items;
        products.forEach((p) => {
            totalSum += p.quantity * p.productId.price;
        });
        // return stripe.checkout.sessions
        //     .create({
        //         payment_method_types: ["card"], // accept credit card payments
        //         line_items: products.map((product) => {
        //             return {
        //                 name: product.productId.title,
        //                 description: product.productId.description,
        //                 amount: product.productId.price * 100,
        //                 currency: "usd",
        //                 quantity: product.quantity,
        //             };
        //         }),
        //         success_url:
        //             req.protocol + "://" + req.get("host") + "/checkout/success", //http://localhost:3000/checkout/success
        //         cancel_url:
        //             req.protocol + "://" + req.get("host") + "/checkout/cancel",
        //     })
        //     .then((session) => {
                res.json({
                    results: user.cart.items.length,
                    totalPrice: totalSum,
                    data: products,
                });
            // });
    } catch (err) {
        console.log(err);
    }
};
