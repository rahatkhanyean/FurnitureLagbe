const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const fileUpload = require('express-fileupload');
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'nimo',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.globalVariable = 1;
  next();
});





mongoose.connect('mongodb://localhost:27017/FurnitureLagbe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const user = mongoose.model('users',userSchema);

const productSchema = new mongoose.Schema({
  _id: String,
  product_id: Number,
  product_name: String,
  product_type: String,
  product_category_id: Number,
  product_list_price: Number,
  product_uom_id: Number,
  product_pos_categ_id: Number,
  product_uom_name: String,
  product_uom_category_name: String,
  product_category_name: String,
  product_category_complete_name: String,
});

const gp_productschema = new mongoose.Schema({
  gp_id: Number,
  gp_name: String,
  gp_itemsSold: Number,
  category: String,
  gp_image: String,
  gp_old_price: Number,
  gp_new_price: Number,
});

const orderanddeliveryschema=new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  product: String,
  Price: Number,
  Quantity: Number, 
  Customize_Order: String,


});

const orderanddelivery= mongoose.model('delivery and order management',orderanddeliveryschema);

const gp_product = mongoose.model('green_products', gp_productschema);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





//=======================================================================================Module 1======================================================================



app.get('/', (req, res) => {
  res.render('login_module3');
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = mongoose.model('users', userSchema);

  try {
    const loggedInUser = await user.findOne({ username: email, password: password });

    if (loggedInUser) {

      if (loggedInUser.username === 'admin@gmail.com' && loggedInUser.password === 'admin') {
        req.session.user = loggedInUser;
        const gp_product_array = await gp_product.find({});
        
        res.render('admin',{gp_product_array}); 
      } else {
        req.session.user = loggedInUser;
        res.render('index_profile'); 
      }
    } else {
      res.send('Incorrect email or password');
      console.log(req.session.user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/profile', async (req, res) => {
  try {
    if (req.session.user) {
      if (req.session.user.username == "admin@gmail.com") {
        const gp_product_array = await gp_product.find({});
        res.render('admin', { gp_product_array });
      } else {
        res.render('index_profile');
      }
    } else {
      res.status(401).send('Please login first.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/signup', async (req, res) => {
  const { requested_username, requested_password, confirmPassword } = req.body;
  console.log(requested_password,confirmPassword);

  const user_available = await user.findOne({ username: requested_username });

  if (user_available) {
    return res.send('Id already exists');
  }

  const newUser = new user({ username: requested_username, password: requested_password });

  if (requested_password !== confirmPassword) {
    return res.send("Passwords don't match");
  }

  await newUser.save();
  return res.send('signup_success');
});


app.get('/delete-profile', async (req, res) => {


  console.log('On it');
  await user.findOneAndDelete({ username: req.session.user.username });
  console.log('Successful');
  res.render('delete');
});

app.post('/change-password', async (req, res) => {
  const userId = req.session.user.username; 

  try {
      const curruser = await user.findOne({username:userId});
      
      console.log(curruser.password);

      if (!curruser) {
          return res.status(404).send('User not found');
      }

      const { oldpassword, newpassword, confirmpassword } = req.body;

      console.log(oldpassword);
      console.log(newpassword);
     
      if (oldpassword !== curruser.password) {
          return res.status(401).send('Incorrect old password');
      }


      curruser.password = newpassword;
      await curruser.save();

      res.send('Password changed successfully!');
  } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/logout',(req,res) => {
  req.session.destroy(() => {
    res.redirect('/'); 
  });
})

//===================================================================================Module 2+3=============================================================================
app.get('/products', async (req, res)  => {
  const gp_product_array = await gp_product.find({});
  res.render('product_module3',{gp_product_array});
});


//=================================================================================Module 4======================================================================================
app.get('/admin', async (req, res) => {
  const gp_product_array = await gp_product.find({});

  res.render('admin',{gp_product_array});
});


app.get('/deleteProduct/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {

    const deletedProduct = await gp_product.findOneAndDelete({ gp_id: productId });

    if (deletedProduct) {
      console.log(`Product with ID ${productId} deleted successfully`);

      res.redirect('/admin');

  
    } else {
      console.log(`Product with ID ${productId} not found`);
     
      res.redirect('/errorPage');
    }
  } catch (error) {
    console.error(`Error deleting product with ID ${productId}: ${error}`);
    
    res.redirect('/errorPage');
  }
});

app.post('/addProduct', async (req, res) => {
  console.log(req.files.productImage);

  
  try {
    const { productName, unitPrice, quantity, productID } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send('uploading error');
    }

    const productImage = req.files.productImage;
    const imagePath = path.join(__dirname, 'public', 'images', productID + path.extname(productImage.name));
    const mongodbpath=path.join('images',productID + path.extname(productImage.name));


    // Move the uploaded file to the specified path
    productImage.mv(imagePath, (err) => {
      if (err) {
        return res.send('Error uploading image.');
      }

      console.log(`Image uploaded to: ${imagePath}`);

      // Use imagePath when saving to the database
      const newProduct = new gp_product({
        gp_id: productID,
        gp_image: mongodbpath,
        gp_name: productName,
        category: 'best-seller',
        gp_itemsSold: quantity,
        gp_old_price: 16550,
        gp_new_price: unitPrice,
      });

      newProduct.save()
        .then(() => {
          console.log(`New product added successfully.`);
          return res.redirect('admin');
        })
        .catch((error) => {
          console.error('Error adding product:', error);
          res.render('internal server error');
        });
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.render('internal server error');
  }
});
app.get('/Orderanddelivery', async(req,res) => {
  console.log('hi')
  res.render('Orderanddelivery');
});

app.post('/editProduct', async (req, res) => {
  console.log(req.files);
  res.locals.globalVariable = res.locals.globalVariable + 1;
  const updated = res.locals.globalVariable.toString();
  const productId = req.body.id;

  try {
    const newImage = req.files && req.files.photo;

    if (!newImage) {
      return res.status(400).send('No file uploaded.');
    }

    const newPath = path.join(__dirname, "public", "images", productId + " - " + updated + path.extname(newImage.name));
    const mongodbPath = path.join("images",productId+" - "+updated+path.extname(newImage.name));
    console.log(newPath);

    const product = await gp_product.findOne({ gp_id: productId });

    if (!product) {
      return res.status(404).send('Product not found.');
    }

    product.gp_name = req.body.name;
    product.gp_new_price = req.body.price;
    product.gp_image = mongodbPath;

    newImage.mv(newPath); // Move the uploaded file to the specified path

    product.save();

    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submitOrder', async(req, res) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const address = req.body.address;
  const productNames = req.body['productName[]'];
  const prices = req.body['price[]'];
  const quantities = req.body['quantity[]'];
  const customizeOrder = req.body.customizeOrder;

  const newOrder = new orderanddelivery({   name: fullName,
    email: email,
    address: address,
    product: productNames,
    Price: prices,
    Quantity: quantities, 
    Customize_Order: customizeOrder, });
  console.log(newOrder);
  await newOrder.save();
 
  res.send('Order submitted successfully!');
});


