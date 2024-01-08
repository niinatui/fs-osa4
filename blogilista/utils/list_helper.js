const dummy = (blogs) => {
    return 1
  }
  
const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((previous, current) => previous.likes > current.likes ? previous : current)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }