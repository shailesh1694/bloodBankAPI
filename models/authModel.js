const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const validator = require("validator")

const registerSchema = new mongoose.Schema({
    role: {
        type: String,
        required: [true, 'Role is Required !'],
        enum: ['donar', 'organisation','hospital']
    },
    name: {
        type: String,
        required: function () {
            if (this.role === "donar")return [true,"Name is Required Field !"];
            else return false;
        }
    },
    organisation: {
        type: String,
        required: function () {
            if (this.role === "organisation") return [true,"Organisation is Required Field !"];
            else return false;
        }
    },
    hospital: {
        type: String,
        required: function () {
            if (this.role === "hospital") return [true,"Hospital is Required Field !"];
            else return false;
        },

    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email Already Provided !"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email ID !")
            }
        }
    },
    mobile: {
        type: Number,
        required: true,
        unique: [true, "Mobile Number is Required !"],
        minlength: 10
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    website: {
        type: String,
        required:function (){
            if(this.role === "organisation" || this.role === "hospital") return [true,"Website Required "]
            else false
        }
    }
},{timestamps:true});

registerSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword,this.password)
    return isMatch
}

module.exports = mongoose.model("Registeruser",registerSchema)