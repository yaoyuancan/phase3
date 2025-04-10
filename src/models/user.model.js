const mongoose = require('mongoose');

// Define a simple model
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    role: String,
    first_name: String,
    last_name: String,
    bio: String
});
module.exports = mongoose.model('User', UserSchema);

