const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
    },
    author: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
    },
    publishDate: {
        type: Date,
    },
    clickedCount: {
        type: Number, 
        default: 0
    },
    role: {
        type: String
    }
}, {
    timestamps: true,
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog; 
