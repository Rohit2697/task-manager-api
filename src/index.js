const express = require('express');
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('./database/connection')
const UserRouter = require('./router/user')
const TaskRouter = require('./router/task')
const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors({
    origin: "*"
}))
app.use(TaskRouter)
app.use(UserRouter)

app.listen(port, () => {
    console.log(`port is running on ${port}`)
})

