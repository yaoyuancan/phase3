const blogModel = require('../models/blog.model')

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find()
    // Set cache control
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300')
    res.json(blogs)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get blog list', error: error.message })
  }
}

// Get a single blog
exports.getBlog = async (req, res) => {
  try {
    const {id} = req.params
    const blog = await blogModel.findById(id)
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }
    res.json(blog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get blog', error: error.message })
  }
}

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      category: req.body.category
    }

    const newBlog = new blogModel(data)
    await newBlog.save()
    res.status(201).json(newBlog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to create blog', error: error.message })
  }
}

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const {id} = req.params
    const data = req.body
    const findBlog = await blogModel.findById(id)
    if (!findBlog) {
      return res.status(400).json({
        status: 'error',
        message: 'cannot find the blog'
      })
    }
    findBlog.set(data)
    await findBlog.save()
    res.json(findBlog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update blog', error: error.message })
  }
}

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const {id} = req.params
    console.log('deleteBlog', id)
    const findBlog = await blogModel.findByIdAndDelete(id)
    console.log('findBlog',findBlog)
    if (!findBlog) {
      return res.status(400).json({
        status: 'error',
        message: 'cannot find the blog'
      })
    }
    res.json({
      status: 'success',
      message: 'the blog deleted'
    })
  } catch (error) {
    console.error('deleteBlog error:', error)
    res
      .status(500)
      .json({ message: 'Failed to delete blog', error: error.message })
  }
}
