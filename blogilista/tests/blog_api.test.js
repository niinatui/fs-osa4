const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[2])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[3])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are four blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blog identifier is called id', async () => {
    const blogs = await Blog.find({})
    expect(blogs[0]._id).toBeDefined()
})

test('a valid blogpost can be added', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
     }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContainEqual('Type wars')
})

  test('if likes are not defined, the value is 0', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
     }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    const added = await blogsAtEnd.find(blog => blog.title === "Type wars")
    expect(added.likes).toBe(0)
})

test('if request doesnt contain title or url, response 400 bad request', async () => {
    const newBlog = {
        author: "Robert C. Martin",
        likes: 2
      }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('blog can be edited', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToEdit = blogsAtStart[0]

  await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .send({title: "random title"})
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).toContain("random title")
})

afterAll(async () => {
  await mongoose.connection.close()
})