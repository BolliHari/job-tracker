const mongoose = require('mongoose')

const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI
    if (!uri) {
        console.error('Missing MONGO_URI. Add MONGO_URI (or MONGODB_URI) and GEMINI_API_KEY to backend/.env, then save the file so the server restarts.')
        process.exit(1)
    }
    try{
        const conn = await mongoose.connect(uri)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }catch(error){
        console.error(`Error connecting to MongoDB: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB