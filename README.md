# Secure Portfolio and Blog Platform

A secure web application built with Node.js, Express, and EJS featuring authentication, blog management, and user profiles.

## Project Structure

```
project/
├── public/                 # Static files
│   ├── main.js            # Client-side JavaScript
│   ├── style.css          # Global styles
│   └── google-sso.png     # Images
├── src/                   # Source code
│   ├── controllers/       # Route controllers
│   │   ├── blogController.js
│   │   └── profileController.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middle.js
│   │   └── authMiddleware.js
│   ├── models/           # Database models
│   │   ├── blog.model.js
│   │   └── user.model.js
│   ├── routes/           # Express routes
│   │   ├── blogRoutes.js
│   │   └── profileRoutes.js
│   └── data/             # JSON data storage
│       └── blogs.json
├── views/                # EJS templates
│   ├── blog-form.ejs
│   ├── blogs.ejs
│   ├── login.ejs
│   └── profile.ejs
├── server.js            # Main application file
├── package.json         # Project dependencies
└── .env.example        # Environment variables template
```

## Features

- Secure user authentication
- Blog post creation and management
- User profile management
- Google OAuth integration
- HTTPS/SSL support
- Input validation
- XSS protection
- CSRF protection

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `.env`
5. Set up SSL certificates in `ssl/` directory
6. Start the server:
   ```bash
   npm start
   ```

## Security Features

- HTTPS/SSL encryption
- Password hashing
- JWT authentication
- Input validation
- XSS protection
- CSRF protection
- Secure session management
- Rate limiting

## Environment Variables

Required environment variables (see `.env.example`):
- `PORT`: Server port
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `SESSION_SECRET`: Session secret key
- `MONGODB_URI`: MongoDB connection string
