const express = require('express');
const router = new express.Router()
const User = require('../database/Model/User')
const auth = require('../middleware/auth')
const errorGen = require('../error/errorGen');
const Task = require('../database/Model/Task');
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save()
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })

    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token != req.token);
        await req.user.save()
        res.send({ message: "loged out successfully!" })
    } catch (err) {
        res.status(500).send(errorGen(err))
    }
})
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send(errorGen(new Error("no user found")))
        }
        res.send(user)

    } catch (err) {
        res.status(500).send(errorGen(err))
    }
})

router.patch('/users/me', auth, async (req, res) => {
    try {
        const allowedFields = ["name", "email", "password"]
        const receivedFields = Object.keys(req.body)
        const isAllowed = receivedFields.every(field => allowedFields.includes(field));
        if (!isAllowed) throw new Error("field not allowed")

        // const updatedUser = await User.findById(req.params.id);
        // if (!updatedUser) return res.status(404).send(errorGen(new Error("user not found")))
        receivedFields.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(req.user)
    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})
router.delete('/users/me', auth, async (req, res) => {
    try {
        //console.log(req.user)
        await User.findByIdAndDelete(req.user._id)
        await Task.deleteMany({ creator: req.user._id })
        res.send(req.user)
        // const deletedUser = await User.findByIdAndDelete(req.params.id)
        // if (!deletedUser) return res.status(404).send(errorGen(new Error("no user found")))
        // res.send(deletedUser)
    } catch (err) {
        console.log(err)
        res.status(400).send(errorGen(err))
    }
})

module.exports = router