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

const gp_product = mongoose.model('green_products', gp_productschema);






app.get('/products', async (req, res)  => {
  const gp_product_array = await gp_product.find({});
  console.log(gp_product_array);
  res.render('product_module3',{gp_product_array});
});

app.get('/', (req, res) => {
  res.render('login_module3');
});


app.post('/home', async (req, res) => {
  
  const { id, password } = req.body;
  const user = mongoose.model('users',userSchema);
  try {
    console.log(id);
    const customer = await user.findOne({ username:id , password:password});
    console.log('customer',customer);

    if (customer) {
 
      req.session.user=customer;
      res.render('index_profile');
    } else {
  
      res.send('incorrect id and password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
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


//forget password+module 2
