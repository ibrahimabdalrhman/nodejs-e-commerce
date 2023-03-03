const Product = require("../models/product");
const Order = require("../models/order");
const stripe = require("stripe")(
  process.env.STRIPE_KEY
);



exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;

      let totalSum = 0;
      products.forEach((p) => {
        totalSum += p.quantity * p.productId.price;
      });
      res.json({
        results: user.cart.items.length,
        totalPrice: totalSum,
        
        data: user.cart.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  };
  
  exports.addToCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then((product) => {
      console.log("product : ", product);
      return req.user.addToCart(product);
    })
    .then(
      res.json({
        message: "added to cart",
      })
      )
      .catch((err) => {
        console.log(err);
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
      
exports.getCheckout = (req, res, next) => {
  let products;
  let totalSum = 0;         
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      products.forEach((p) => {
        totalSum += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions
        .create({
          payment_method_types: ["card"], // accept credit card payments
          line_items: products.map((product) => {
            return {
              name: product.productId.title,
              description: product.productId.description,
              amount: product.productId.price * 100,
              currency: "usd",
              quantity: product.quantity,
            };
          }),
          success_url:
            req.protocol + "://" + req.get("host") + "/checkout/success", //http://localhost:3000/checkout/success
          cancel_url:
            req.protocol + "://" + req.get("host") + "/checkout/cancel",
        })
        .then((session) => {
          res.json({
            results: user.cart.items.length,
            totalPrice: totalSum,
            data: products,
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
            
            
exports.getSuccessCheckout = (req, res, next) => {
  Order.find({ "user.userId": req.user._id }).then((order) => {
    res.json({
      results: order.length,
      data: order,
    });
  });
};
      

exports.postOrder = (req, res, next) => {
          
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user._id,
        },
        products: products,
      });
      return order.save();
    }).then(order => {
      console.log(order);
      req.user.clearCart();
    })
    .then(() => {
      res.json({
        message: "added order"
      })
    })
    .catch((err) => {
      console.log(err);
    });
};
      


exports.getOrder = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((order) => {
          
      res.json({
        results: order.length,
        data: order
      })
    });
};
      
      
