const express = require("express")
const dotenv = require("dotenv")
const cors = require('cors')
const morgan = require("morgan")
const connectDB = require("./config/db")
const hbs = require("hbs")
const { errorMiddleware } = require("./middlewares/errorMiddleware")


//dot config
dotenv.config()

//DB connection
connectDB()

//rest Object
const app = express();

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(morgan("dev"))

//routes
app.use('/api/v1/test', require("./routes/registerRoute"))
app.use('/api/v1/test', require("./routes/inventoryRoute"))

app.use(errorMiddleware)

//port
const PORT = process.env.PORT || 3001


app.listen(PORT, () => {
    console.log(`${PORT}`)
})