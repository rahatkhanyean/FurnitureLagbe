const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'nimo',
  resave: false,
  saveUninitialized: true,
}));





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

      if (loggedInUser.username === 'admin@gmail.com' && loggedInUser.password === 'av') {
        req.session.user = loggedInUser;
        res.render('admin'); 
      } else {
        req.session.user = loggedInUser;
        res.render('index_profile'); 
      }
    } else {
      res.send('Incorrect email or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.post('/signup', async (req, res) => {
  const { requested_username, requested_password, confirmPassword } = req.body;
      const user_available = await user.findOne({username:requested_username});
      console.log(user_available);
      if (user_available){
        res.send('Id already exists');
      }
      const newUser = new user({ username:requested_username, password:requested_password });
      if(requested_password!=confirmPassword){
        res.send("Passwords don't match");
      }
      else{
      await newUser.save();
      }
    
      res.send('signup_success');
  
    });

app.get('/delete-profile', async (req, res) => {


  console.log('On it');
  await user.findOneAndDelete({ username: req.session.user.username });
  console.log('Successful');
  res.render('delete');
});



app.post('/logout',(req,res) => {
  req.session.destroy(() => {
    res.render('index_home'); 
  });
})

//===================================================================================Module 2+3=============================================================================
app.get('/products', async (req, res)  => {
  const gp_product_array = await gp_product.find({});
  console.log(gp_product_array);
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

      res.redirect('Module 4/admin');
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
  try {
    const { productName, unitPrice, quantity, productID } = req.body;

   
    const existingProduct = await gp_product.findOne({ gp_id: productID });

    if (existingProduct) {
      console.log(`Product ID ${productID} already exists. Try with a different product ID.`);
      return res.status(400).render('error', { message: 'Product ID already exists. Try with a different product ID.' });
    } else {
      console.log(`Adding new product - ID: ${productID}, Name: ${productName}, Quantity: ${quantity}, Unit Price: ${unitPrice}`);
      
      
      const newProduct = new gp_product({
        gp_id: productID,
        gp_image: 'images/5.jpg',
        gp_name: productName,
        gp_itemsSold: quantity,
        gp_old_price: 16550,
        gp_new_price: unitPrice,
      });

      await newProduct.save();

      console.log(`New product added successfully.`);
      return res.redirect('Module 4\admin'); 
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.render('internal server error'); 
  }
});

app.get('/Orderanddelivery', async(req,res) => {
  console.log('hi')
  res.render('Module 4\Orderanddelivery');
});

app.post('/editProduct', async (req, res) => {
  const productId = req.body.id;
  console.log(productId);

  try {
    
    const product = await gp_product.findOne({gp_id:productId});
    console.log(product);
   
    product.gp_name = req.body.name;
    product.gp_new_price = req.body.price;
    product.gp_image = req.body.image;

    await product.save();
    

    res.redirect('/admin');
  } catch (error) {
    console.error(error);
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
