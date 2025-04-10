require('dotenv').config();
const express = require('express')
const cors = require('cors')
// const helmet = require('helmet')
const morgan = require('morgan')
const https = require('https')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const userModel = require('./src/models/user.model')
const blogModel = require('./src/models/blog.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { OAuth2Client } = require('google-auth-library');

// Google OAuth configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/auth/google/callback';

// Create OAuth client
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const agent = new https.Agent({
  rejectUnauthorized: false // Ignore self-signed certificates
});

// MongoDB 
const mongoURI = process.env.MONGODB_URL;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Initialize Express application
const app = express()

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, './ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/certificate.pem'))
}
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Middleware configuration
// app.use(helmet()) // Add security HTTP headers
app.use(cors()) // Enable CORS
app.use(morgan('dev')) // Logger middleware
app.use(express.json()) // Parse JSON request body
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(cookieParser('RlKRNB5z-I22OrplMVHf7tvzljHvUgMTdKHE')); // Use signature cookie
// app.use(csrf({ cookie: true }));

// Set CSRF protection (cookie based only)
const csrfProtection = csrf({ cookie: { key: '_csrf', signed: true } });
// app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request body



// Error handling (if CSRF verification fails)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('CSRF token validation failed');
  } else {
    next(err);
  }
});


async function initApp() {
  // 1. clear the users data
  const userCount = await userModel.countDocuments()
  if (userCount===0) {
    // 2. add users
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'user',
        password: 'user123',
        role: 'user'
      }
    ]
    for(const user of users) {
      const hashPassword = await bcrypt.hashSync(user.password, 10)
      const newUser = new userModel({
        username: user.username,
        role: user.role,
        password: hashPassword
      })
      newUser.save()
    }
  }

  // 3. add blogs
  const blogCount = await blogModel.countDocuments()
  if (blogCount === 0) {
    const blogs = require('./src/data/blogs.json')
    await blogModel.insertMany(blogs)
  }
}

initApp()


// Base route
app.get('/', (req, res) => {

  const userModel = require('./src/models/user.model')
  const newData = new userModel({
    username: 'admin',
    password: 'password',
    role: 'admin'
  })

  newData.save()


  res.json({
    message: 'Welcome to Developer Portfolio API Service',
    endpoints: {
      portfolios: '/api/portfolios',
      blogs: '/api/blogs'
    }
  })
})

// login page
app.get('/login', csrfProtection,(req, res) => {
  // Inspection and certification cookie
  if (req.signedCookies.token) {
    return res.redirect('/blogs');
  }
  console.log('login csrfToken', req.csrfToken())
  // res.sendFile(path.join(__dirname, 'public', 'login.html'));
  res.render('login', {title: 'Login page', csrfToken: req.csrfToken()})
});

const authenticateToken = require('./src/middlewares/auth.middle')

// blog list page
app.get('/blogs', authenticateToken, async (req, res) => {
  const token = req.signedCookies.token || req.cookies.token;
  console.log('blogs token', token)
  console.log('user', res.user)
  const result = await axios.get('https://localhost:3000/api/blogs',{ httpsAgent: agent })
  console.log('result', result.data)
  res.render('blogs', {title:'Blog List' , user: res.user, blogs: result.data})
});

app.get('/profile', csrfProtection, authenticateToken, async (req, res) => {
  // TODO: 步骤
  // 1. 获取到用户数据
  // 2. 传递到页面
  const userinfo = res.user
  console.log('userinfo1',userinfo)
  res.render('profile', { user: userinfo, title: 'Update profile', csrfToken: req.csrfToken()} )
});

app.get('/blog/add', csrfProtection, authenticateToken, async (req, res) => {
  res.render('blog-form', { blog: null, csrfToken: req.csrfToken()} )
});

app.get('/blog/update', csrfProtection,authenticateToken, async (req, res) => {
  const id = req.query.id
  console.log('/blog/update id=',id)
  if (!id || id.length !== 24) {
    return res.json({
      status: 'error',
      message: 'blog id is required'
    })
  }
  console.log('id', id)
  const blog = await blogModel.findById(id)
  res.render('blog-form', {blog: blog, csrfToken: req.csrfToken()})
});

app.get('/logout', async (req, res)=>{
  res.clearCookie('token');
  // redirect to /login page
  // res.json({ status: 'success', message: 'Logged out successfully' });
  res.redirect('/login');
})

// Processing login requests
app.post('/login', csrfProtection,async (req, res) => {
  console.log('login post: ', req.body)
  const { username, password } = req.body;
  if (!username) {
    return res.status(401).json({
      status: 'error',
      message: 'username is required'
    })
  }
  if (!password) {
    return res.status(401).json({
      status: 'error',
      message: 'password is required'
    })
  }
  // 1. find the user from the database
  const findUser = await userModel.findOne({username:username})
  if (!findUser) {
    return res.status(404).json({
      status: 'error',
      message: 'cannot find the user'
    })
  }
  // 2. check the password
  const match = await bcrypt.compareSync(password, findUser.password)
  console.log('match', match)
  if (!match) {
    return res.status(404).json({
      status: 'error',
      message: 'the password is wrong'
    })
  }

  // Generate a JWT Token and set the validity period to 24 hours
  const token = jwt.sign({ username: findUser.username, role: findUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    // Set HttpOnly cookies to prevent XSS attacks
    res.cookie('token', token, {
      signed: true,
      httpOnly: true, 
      maxAge: 3600000 * 24, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' // Additional protection against CSRF attacks
  });
  res.redirect('/blogs')
  // res.json({
  //   status: 'success',
  //   message: 'login successful'
  // })
});

// Initialize Google login
app.get('/auth/google', csrfProtection,(req, res) => {
  // Generate the Google authentication URL with required scopes
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent' // Force prompt to ensure getting refresh token
  });
  
  // Redirect to Google's OAuth page
  res.redirect(authUrl);
});

// Google OAuth callback handling
app.get('/auth/google/callback',async (req, res) => {
  try {
    // Get authorization code from the callback URL
    const code = req.query.code;
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }
    
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info using the access token
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    // axios The successful response contains the data directly
    const userData = response.data;
    console.log('User data received:', userData.email);
    // Store user info in a cookie (in a real app, you'd want to store
    // just a session ID and keep the user data in a database)
    // const user = {
    //   id: userData.id,
    //   email: userData.email,
    //   name: userData.name,
    //   picture: userData.picture
    // };
    const findUser = await userModel.findOne({username: userData.email})
    if (!findUser) {
      const hashPassword = await bcrypt.hashSync(userData.email, 10)
      const newUser = await userModel({
        username: userData.email,
        password: hashPassword,
        role: 'user'
      })
      await newUser.save()
    }

    
  const token = jwt.sign({ username: userData.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  res.cookie('token', token, {
      signed: true,
      httpOnly: true, 
      maxAge: 3600000 * 24, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' 
  });
  
    console.log('token',token)
    // Redirect to home page
    res.redirect('/blogs')
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed');
  }
});
// Import profile routes
const profileRoutes = require('./src/routes/profileRoutes');
// Import routes
const blogRoutes = require('./src/routes/blogRoutes')
// Register routes
app.use('/api', blogRoutes)
app.use('/api', profileRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal Server Error' })
})

// Start HTTPS server
const PORT = process.env.PORT || 3000
const httpsServer = https.createServer(sslOptions, app)

httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`)
  console.log(`Visit https://localhost:${PORT} to test the API`)
})

module.exports = app
