const Product = require("../models/product");
const fileHelper = require("../util/file");


const itemPage = 30;
let numPages;


exports.home = (req, res, next) => {
  const page = req.query.page || 1;
  Product.find()
    .then((prods) => {
      numPages = Math.ceil(prods.length / itemPage);
      return Product.find()
        .skip((page - 1) * itemPage)
        .limit(itemPage);
    })
    .then((products) => {

      res.render("index", {
        products: products,
        numPages: numPages,
        currentPage: page,
        user: req.user,
        isLoggedin: req.session.isloggedin,
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

// product/:id
exports.productById = async (req, res) => {
  const id = req.body.id;
  try {
    
  
    const product = await Product.findById(id);
    res.render("singleProduct"
      , {
        product: product,
        user: req.user,
        isLoggedin: req.session.isloggedin,
      }
    );
  } catch (err) {
    console.log(err);
  }
  
};

exports.products = (req, res, next) => {
  const page = req.query.page || 1;
  Product.find()
    .then((prods) => {
      numPages = Math.ceil(prods.length / itemPage);
      return Product.find()
        .skip((page - 1) * itemPage)
        .limit(itemPage);
    })
    .then((products) => {
      console.log("home user: ", req.user);
      console.log("home logged: ", req.session.isloggedin);
      res.render("products", {
        products: products,
        numPages: numPages,
        currentPage: page,
        user: req.user,
        isLoggedin: req.session.isloggedin,
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

exports.favourites = async (req, res, next) => {
  const page = req.query.page || 1;
  const user = await req.user.populate("favourites");
  const products = user.favourites.slice(
    (page - 1) * itemPage, page * itemPage
  );
    console.log(products);
  numPages = Math.ceil(products.length / itemPage);
  res.render("favourites", {
    products: products,
    numPages: numPages,
    currentPage: page,
    user: req.user,
    isLoggedin: req.session.isloggedin,
  });
  

};

exports.addFav = async (req, res, next) => {
  const id = req.body.id;
  try {
    if (req.user.favourites.includes(id)) {
      const index=req.user.favourites.indexOf(id)
      req.user.favourites[index]=undefined;
    }
    else {
      req.user.favourites.push(id);
    }
    await req.user.save();
    res.redirect("/favourites");
  } catch (err) {
    console.log(err);
  }
};

exports.cart = (req, res, next) => {
  Product.find()
    // .populate('userId')
    // .select('title price -_id -userId')
    .then((products) => {
      res.render("cart", {
        user: req.user,
        isLoggedin: req.session.isloggedin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.Orders = (req, res, next) => {
  Product.find()
    // .populate('userId')
    // .select('title price -_id -userId')
    .then((products) => {
res.render("Orders", {
  user: req.user,
  isLoggedin: req.session.isloggedin,
});    })
    .catch((err) => {
      console.log(err);
    });
};

exports.admin = (req, res, next) => {
  const page = req.query.page || 1;
console.log("mmmmmmmmmmmmmmm", req.session.isloggedin);
  if (!req.session.isloggedin) {
    res.render("admin", {
      user: req.user,
      isLoggedin: req.session.isloggedin,
    });
  } else {
    Product.find({ userId: req.user._id })
      .then((prods) => {
        numPages = Math.ceil(prods.length / itemPage);
        return Product.find()
          .skip((page - 1) * itemPage)
          .limit(itemPage);
      })
      .then((products) => {
        res.render("admin", {
          products: products,
          numPages: numPages,
          currentPage: page,
          user: req.user,
          isLoggedin: req.session.isloggedin,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};


exports.getUpdateProduct = async (req, res, next) => {
  const id = req.body.id;
  const product = await Product.findById(id);
  res.render("updateProduct", {
    product: product,
    user: req.user,
    isLoggedin: req.session.isloggedin,
  });
};


exports.postUpdateProduct = async (req, res, next) => {
  const id = req.body.id;
  const product = await Product.findByIdAndUpdate(id, {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    image:req.file.path
  });
  res.redirect("admin");
};

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (product.image) {
      fileHelper.deleteFile(product.image);
    }
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.redirect("/admin");
    
  } catch (err) { console.log(err); }

};

exports.newProduct = (req, res, next) => {
  res.render("newProduct", {
    user: req.user,
    isLoggedin: req.session.isloggedin,
  });
};


exports.postNewProduct = async(req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file.path;
  const description = req.body.description;
  console.log("body json : ", req.body);
  console.log("image : ", image);
  try {
    const product = new Product({
      title: title,
      price: req.body.price,
      image: req.file.path,
      description: req.body.description,
      userId: req.user._id
    });
    const result = await product.save();
    console.log("success added : ",result);
    res.redirect('/admin')
  } catch (err) {
    console.log(err);
  }

};


// /admin/update/:id
exports.updateProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  console.log("body json : ", req.body);
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then(() => {
      res.json({ message: "product updated" });
    })
    .catch((err) => {
      console.log(err);
    });
};



