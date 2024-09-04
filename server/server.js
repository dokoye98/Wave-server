const express = require("express")
const {restart} = require("nodemon")
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')
const bodyParser = require('body-parser')
const UserRouter = require('./routes/user')
const PostRouter = require('./routes/post')
app.use(cors())
app.use(bodyParser.json())

app.use('/api',UserRouter)
app.use('/',PostRouter)

mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log('DB connected')
})

app.listen(3000,()=>{
    console.log('wave is running')
})

