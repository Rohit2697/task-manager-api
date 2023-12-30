const errorGen = require('../error/errorGen')
const jwt = require('jsonwebtoken')
const User = require('../database/Model/User')
const auth = async (req, res, next) => {
    try {

        const token = req.headers['authorization'].replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        if (!user) throw new Error()
        req.token = token;
        req.user = user;
        next()
    } catch (err) {
        console.log(err)
        res.status(401).send(errorGen(new Error('please authenticate!')))
    }
}

module.exports = auth