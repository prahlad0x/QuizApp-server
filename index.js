const express = require('express')
const cors = require('cors')
const { db } = require('./db')
const { quiz_router } = require('./routers/qRouters/routes')
const { task_board_router } = require('./routers/tRouters/board.routes')
const { task_tasks_router } = require('./routers/tRouters/task.routes')
const { checker } = require('./middleware/task.checker')
const { t_user_router } = require('./routers/tRouters/user.routes')

const app = express()
require('dotenv').config()

app.use(express.json())
app.use(cors())

app.get('/home', async(req, res)=>{
    return res.status(200).send("Welcome ......")
})

// for quiz routes
app.use("/Quiz", quiz_router)

// for task routes
app.use('/Task/user', t_user_router)
app.use(checker)
app.use("/Task", task_board_router)
app.use("/Task", task_tasks_router)

app.listen(process.env.port, async()=>{
    try {
        await db
        console.log('connect to database.')
        console.log("connected to server")
    } catch (ee) {
        console.log(ee)
    }
})