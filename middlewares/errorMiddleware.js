
function errorMiddleware(error, req, res, next) {
    res.status(error.status).send({
        success: false,
        msg: error.message
    })
}

module.exports = { errorMiddleware }
