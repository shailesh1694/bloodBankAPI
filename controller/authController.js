const Registeruser = require("../models/authModel")
const bcrypt = require('bcryptjs')
const Jwt = require("jsonwebtoken")
const CustomeError = require("../utils/customeError")


async function registerController(req, res, next) {


  try {
    const existUser = await Registeruser.findOne({ email: req.body.email })
    if (existUser) {

      const error = new CustomeError("Already Register user !", 400)
      return next(error)
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10)
    req.body.password = hashPassword


    const register = new Registeruser(req.body)
    await register.save()

    res.status(201).send({ success: true, msg: "Uset Register successful !" })

  } catch (error) {
    const err = new CustomeError(error.message, 500)
    next(err)
  }

}


async function loginController(req, res, next) {
  try {
    if (!req.body.email || !req.body.password || !req.body.role) {
      const error = new CustomeError("Please Check Request Boday !", 422)
      return next(error)

    }
    const Finduser = await Registeruser.findOne({ email: req.body.email })

    if (!Finduser) {
      const error = new CustomeError("Invalid Credential !", 404)
      return next(error)
    }

    if (Finduser.role !== req.body.role) {
      const error = new CustomeError(`User Not register as ${req.body.role} `, 404)
      return next(error)
    }

    const isMatch = await Finduser.comparePassword(req.body.password)

    if (!isMatch) {
      const error = new CustomeError("Password Incorrect !", 404)
      return next(error)
    }

    const token = await Jwt.sign({ userId: Finduser._id }, process.env.SECRET_KEY)
    res.status(200).send({
      success: true,
      token: `Berear ${token}`,
      msg: "Login SucessFull"
    })

  } catch (error) {
    const err = new CustomeError(error.message, 500)
    next(err)
  }

}
module.exports = { registerController, loginController } 