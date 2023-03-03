const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require('../util/file');


const itemPage = 20;
let numPages;
exports.getAllProducts = (req, res, next) => {
  const page =req.query.page ||1 ;
  Product.find().then(prods => {
    numPages =Math.ceil( prods.length / itemPage);
    console.log(numPages);
    return Product.find()
      .skip((page - 1) * itemPage)
      .limit(itemPage);
  })
    // .populate('userId')
    // .select('title price -_id -userId')
    .then((products) => {
      res.json({
        numPages: numPages,
        currentPage:page,
        results: products.length,
        data: products,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err,
      });
    });
};

// /admin/product/:id
exports.getProductById = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      res.json({
        data: product,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err,
      });
    });
};

// /admin/add-product
exports.addProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(500).json({
      status: 'error',
      msg: errors.array()[0].msg
    })
  };
  

  // console.log(req.session.isLoggedIn);
  // if (!req.session.isloggedin) {
  //   return res.send("you must login");
  // }

  const title = req.body.title;
  const price = req.body.price;
  const image = req.body.image;
  // const image = req.file.path;
  const description = req.body.description;

  console.log("body json : ", req.body);
  const product = new Product({
    title: title,
    price: price,
    image: image,
    description: description,
    userId: req.user._id,
  });
  product
    .save()
    .then((data) => {
      console.log("done..");
      res.json({
        message: "added 1 product",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err,
      });
    });
};

//get products to update or delete
exports.adminProducts = (req, res, next) => {
  Product.find({ userId : req.user._id})
    // .populate('userId')
    // .select('title price -_id -userId')
    .then((products) => {
      res.json({
        results: products.length,
        data: products,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err
      });
    });
};

// /admin/update/:id
exports.updateProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(500).json({
      status: "error",
      msg: errors.array()[0].msg,
    });
  };
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file.path;
  const description = req.body.description;
  console.log("body json : ", req.body);
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      console.log("product ::",product);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.json({
          status: "fail",
          msg: "this user can't update this product",
        });
      }
      product.title = title;
      product.price = price;
      product.image = image;

      product.description = description;
      return product.save();
    })
    .then(() => {
      res.json({ message: "product updated" });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err,
      });
    });
};

// /admin/delete/:id
exports.deleteProduct = (req, res, next) => {
  const id = req.params.id;

  Product.findById(id)
    .then(product => {
      console.log(product);
      if (!product) {
        return next(new Error("product not found "));
      }


      if (product.userId.toString() !== req.user._id.toString()) {

        return next(new Error("this user can't delete this product"));

      }
      // if (product.image) {
      //   fileHelper.deleteFile(product.image).then(data => {
      //     console.log("done delte img");
      //   }).catch((err) => { 
      //     console.log("can't find img");
      //   });
      // }

      Product.deleteOne({ userId: req.user._id, _id: id })
        .then((product) => {
          res.json({
            status: "success",
            message: "Deleted Product Success",
          });
        })
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "error",
        err: err,
      });
    });

  // Product.findById(id)
  //   .then(product => {
  //     if (product.userId != req.user._id) {
  //       console.log("product",product);
  //       console.log("userId",product.userId);
  //       console.log("params Id", req.user._id);
  //       return res.json({
  //         status: "fail",
  //         msg: "this user can't delete this product",
  //       });
  //     }
  //     return Product.findByIdAndRemove(id)
  //   })
  //   .then(() => {
  //     res.json({
  //       status:'success',
  //       message: "Deleted Product Success",
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};
