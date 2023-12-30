const mongoose = require('mongoose')
const { Schema } = mongoose
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        trim: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Invalid Email!")
        }
    },
    password: {
        type: String,
        minLength: 6,
        trim: true,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();
    delete userObj.tokens
    delete userObj.password

    return userObj
}
UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    console.log(token)
    user.tokens.push({ token })
    await user.save()
    return token

}
UserSchema.statics.findByCredential = async (email, password) => {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new Error('Unable to Login')
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Unable to Login')
    return user
}

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
})

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'creator'
})
const User = mongoose.model('User', UserSchema)

module.exports = User


