module.exports = function errorGen(err) {
    return {
        error: {
            message: err.message
        }
    }
}