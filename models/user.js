const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { schema } = require("./product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  favourites: [
    {
        type: Schema.Types.ObjectId,
        ref: "Product",
    }
  ],

});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });
  // console.log("cartProductIndex : ", cartProductIndex);

  let newQuantity = 1;
  const updatedCartItem = [...this.cart.items];
  // console.log("updatedCartItem : ", updatedCartItem);

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItem[cartProductIndex].quantity = newQuantity;
    // console.log("updatedCartItem : ", updatedCartItem);
  } else {
    updatedCartItem.push({
      productId: product._id,
      quantity: newQuantity,
    });
    // console.log("updatedCartItem : ", updatedCartItem);
  }
  const updateCart = {
    items: updatedCartItem,
  };
  // console.log("updateCart : ", updateCart);

  this.cart = updateCart;
  // console.log("this : ", this);
  return this.save();
};


userSchema.methods.addQuantityToCart = function (product,Quantity) {
  const cartProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });
  // console.log("cartProductIndex : ", cartProductIndex);

  let newQuantity = Quantity;
  const updatedCartItem = [...this.cart.items];
  // console.log("updatedCartItem : ", updatedCartItem);

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + Quantity;
    updatedCartItem[cartProductIndex].quantity = newQuantity;
    // console.log("updatedCartItem : ", updatedCartItem);
  } else {
    updatedCartItem.push({
      productId: product._id,
      quantity: newQuantity,
    });
    // console.log("updatedCartItem : ", updatedCartItem);
  }
  const updateCart = {
    items: updatedCartItem,
  };
  // console.log("updateCart : ", updateCart);

  this.cart = updateCart;
  // console.log("this : ", this);
  return this.save();
};



//=> delete item from cart
userSchema.methods.deleteItemFromCart = function (product) {
  const updateCart = this.cart.items.filter((item) => {
    return item.productId.toString() !== product._id.toString();
  });
  this.cart.items = updateCart;
  return this.save();
};



userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
}




module.exports = mongoose.model("User", userSchema);
