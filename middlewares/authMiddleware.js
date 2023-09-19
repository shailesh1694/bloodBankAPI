const jwt = require("jsonwebtoken")
const CustomeError = require("../utils/customeError")

async function authMiddleware(req, res, next) {
    const { headers } = req
    try {
        const authorization = headers.authorization.split(" ")[1]
        if (!authorization) {
            const err = new CustomeError("No authtoken found !", 400)
            return next(err)
        }

        const payload = await jwt.verify(authorization, process.env.SECRET_KEY)
        if (!payload) {
            const err = new CustomeError("Auth Token Expire !", 400)
            return next(err)
        }

        req.user = { userId: payload.userId }
        next()
    } catch (error) {
        const err = new CustomeError("authorization error", 400)
        return next(err)
    }

}

module.exports = authMiddleware;