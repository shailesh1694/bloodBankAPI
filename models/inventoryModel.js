const mongoose = require("mongoose")
const validator = require("validator")

const invetorySchema = new mongoose.Schema({

    inventoryType: {
        type: String,
        required: true,
        enum: ["in", "out"],
    },
    bloodgroup: {
        type: String,
        required: true,
        enum: ["A+", "A-", "AB+", "AB-", "O+", "O-", "B+", "B-"]
    },
    quntity: {
        type: Number,
        required: [true,"Blood Quntity is required"],
    },
    email: {
        type: String,
        required: [true,"Email is required"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email ID !")
            }
        }
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true,"organization is required"],
        ref: "Registeruser"
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registeruser",
        required: function () {
            if (this.inventoryType === "out") [true, "Not Register as Hospital !"]
            else false
        }
    },
    donar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registeruser",
        required: function () {
            if (this.inventoryType === "in") [true, "Not Register as Donor !"]
            else false
        },
    }

},
    { timestamps: true })

module.exports = mongoose.model("Inventories", invetorySchema)