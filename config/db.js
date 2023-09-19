const mongoose = require("mongoose")


const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/bloodBank")
            .then((res) => { console.log(`connected at ${mongoose.connection.host}`) })
            .catch((error) => { console.log("Not connected") })

    } catch (error) {
        console.log("error in DB connection")
    }
}

module.exports = connectDB