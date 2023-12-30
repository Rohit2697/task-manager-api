const express = require('express');
const router = new express.Router()
const Task = require('../database/Model/Task')
const errorGen = require('../error/errorGen');
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({ ...req.body, creator: req.user._id })
        await task.save()
        res.status(201).send({
            message: "Task Created Successfully",
            task: task
        })
    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ creator: req.user._id })
        await req.user.populate('tasks')
        res.send(req.user.tasks)
    } catch (err) {
        res.status(500).send(errorGen(err))
    }
})
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findOne({ _id, creator: req.user._id })
        if (!task) return res.status(404).send(errorGen(new Error("no task found")))
        res.send(task)
    } catch (err) {
        res.status(500).send(errorGen(err))
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const allowedFields = ["title", "description", "dueDate", "status", "assignee"]
        const receivedFields = Object.keys(req.body)
        const isAllowed = receivedFields.every(field => allowedFields.includes(field))
        if (!isAllowed) throw new Error("field not allowed");
        // if (req.body["status"] == "completed") req.body["completionDate"] = new Date().toISOString()
        const updatedTask = await Task.findOne({ _id: req.params.id, creator: req.user._id });
        if (!updatedTask) return res.status(404).send(errorGen(new Error("unable to find task")))
        receivedFields.forEach(update => updatedTask[update] = req.body[update])
        await updatedTask.save()
        //const updatedTask = await Task.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdatedDate: new Date().toISOString() }, { new: true, runValidators: true });
        res.send(updatedTask)
    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id })
        if (!deletedTask) return res.status(404).send(errorGen(new Error("task not found")))
        res.send(deletedTask)
    } catch (err) {
        res.status(400).send(errorGen(err))
    }
})

module.exports = router