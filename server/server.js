const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')


const secretKey = 'InventoryManagement';
app.use(cors());
app.use(express.json());
app.use(cookieParser())


mongoose.connect('mongodb+srv://amitx13:Amitkvs981@cluster0.ettltuj.mongodb.net/');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  password: { type: String, required: true }
});

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    received_date: {
      type: Date,
      required: true,
    },
    dispatched_date: {
      type: Date,
      default: null,
    },
  },
  quantity: {
    received_quantity: {
      type: Number,
      required: true,
    },
    dispatched_quantity: {
      type: Number,
      default: null,
    },
  },
});

const Component = mongoose.model('Component', componentSchema);

const User = mongoose.model('User',userSchema);

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

app.post('/api/components', async (req, res) => {
  try {
    const {name,received_quantity,received_date} = req.body
    const component = new Component({
      name,
      date: { received_date },
      quantity: { received_quantity },
    });
    await component.save();
    res.status(201).json(component);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/components', async (req, res) => {
  try {
    const components = await Component.find();
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/components/:qrIdentifier', async (req, res) => {
  try {
    
    const component = await Component.findOne({ QR_Identifier: req.params.qrIdentifier });
    if (!component) {
      res.status(404).json({ message: 'Component not found' });
      return;
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/components/:Id', async (req, res) => {
  try {
    const { name,  received_quantity, received_date,dispatched_quantity,dispatched_date } = req.body;
    const parsedDateR = new Date(received_date);
    const parsedDateD = dispatched_date ? new Date(dispatched_date) : null;


    const updateObj = {
      name,
      'date.received_date': parsedDateR,
      'date.dispatched_date': parsedDateD,  
      'quantity.received_quantity': received_quantity,
      'quantity.dispatched_quantity': dispatched_quantity,
    };


    const component = await Component.findByIdAndUpdate(
      req.params.Id,
      updateObj,
      { new: true } 
    );

    if (!component) {
      res.status(404).json({ message: 'Component not found' });
      return;
    }

    res.json(component);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});




app.delete('/api/components/:Id', async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.Id);
    if (!component) {
      res.status(404).json({ message: 'Component not found' });
      return;
    }
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if(!(email && password)){
      res.status(400).send('Invalid Input')
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password,user.password))) {
      const token = jwt.sign({ email: user.email, userId: user._id }, secretKey, { expiresIn: '2h' });
      user.token = token;
      user.password=undefined;

      const option = {
        expires: new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true
      }
      res.status(200).cookie("token",token,option).json({
        success:true,
        token,
        user
      })
    }
    else{
       return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const EncPassword = await bcrypt.hash(password,10)
    const newUser = await User.create({
       name,
       email,
       password: EncPassword
      });

    const token = jwt.sign({ email: newUser.email, userId: newUser._id }, secretKey, { expiresIn: '2h' });

    newUser.token = token;
    newUser.password= undefined;

     const option = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, option).json({
      success: true,
      token,
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.use((err,req,res,next)=>{
  res.status(404).json({
    msg:"something went wrong"
  })
})

app.listen(3000,()=>{
  console.log("Server is running on port 3000")
})