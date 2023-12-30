const mongoose = require('mongoose')
const { Schema } = mongoose
const getDueDefaultDate = () => {
    const dateObj = new Date
    return new Date(dateObj.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
}
const TaskSchema = new Schema({

    "title": {
        type: String,
        required: true,
        trim: true
    },
    "description": {
        type: String,
        required: true,
        trim: true
    },
    "dueDate": {
        type: Date,
        default: getDueDefaultDate

    },
    "status": {
        type: String,
        default: "in_progress",
        trim: true,

        validate(value) {
            if (!["completed", "in_progress", "not_started"].includes(value)) {
                throw new Error("status is Invalid")
            }
        }
    },
    "priority": {
        type: String,
        default: "medium",
        trim: true,
        validate(value) {
            if (!["low", "high", "medium", "critical"].includes(value)) {
                throw new Error("priority is Invalid")
            }
        }
    },
    "assignee": {
        type: String,
        trim: true,

    },
    "creator": {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },


    "tags": {
        type: Array,
        default: null
    },
    "attachments": {
        type: Buffer,
        default: null
    },
    "comments": {
        type: Array,
        default: null
    },
    "completionDate": {
        type: Date,
        default: null
    }

}, {
    timestamps: true
})

TaskSchema.pre('save', function () {
    const task = this;
    if (task.isModified('status')) {
        if (task.status == 'completed') {
            task.completionDate = new Date().toISOString()
        }
    }
})


const Task = mongoose.model('Task', TaskSchema)
module.exports = Task;

// const task = new Task({
//     title: "abc",
//     description: "asassa",
//     status: "in_pgress",
//     assignee: "rohit",
//     creator: "rohit",

// })
