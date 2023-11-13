const express = require('express')
const jwt = require('jsonwebtoken')
const b = require('bcrypt')
require('dotenv').config()
const {User} = require('../../models/tModels/user.model')
const Board = require('../../models/tModels/board.model');
const Task = require('../../models/tModels/tasks.model');
const Subtask = require('../../models/tModels/subtask.model');
const t_user_router = express.Router()

t_user_router.post('/login', async(req, res)=>{
    let {email , password} = req.body
    try {
        let user = await User.findOne({email})
        if(!user) return res.status(404).send({msg : "User Not found !", isOk : false})
        else{
            let ispassword = b.compareSync(password, user.password)
            if(!ispassword) return res.status(400).send({msg: "Wrong Credientials !", isOk : false})
            else{
                const token = jwt.sign({email}, process.env.secretKey, {expiresIn : "7d"})
                let boards = await Board.find({user_email:email})
                if(!boards.length){
                    const board = new Board({name:"Board 1", user_email:email})
                    const newBoard = await board.save()
                    const newTask = new Task({
                        title : 'Add Some Tasks',
                        description : "try our product",
                        status : "Todo",
                        boardId: newBoard._id,
                        user_email : email
                      })
                    
                    let savedTask = await newTask.save()

                    let  subTask = new Subtask({title:"Add some tasks.", user_email:email, taskId:savedTask._id})
                    let savedSubtask = await subTask.save()

                    await Task.findByIdAndUpdate(savedTask._id, { $push: { subtasks: savedSubtask._id } })
                    await Board.findByIdAndUpdate(newBoard._id, { $push: { tasks: newTask._id } });
                }
                return res.status(200).send({msg : "login successful", isOk : true, user : user , token:token})
            }
        }
        
    } catch (error) {
        console.log(error)
        return res.status(404).send({msg : "Wrong Credientials !", isOk : false})
    }
})

t_user_router.post('/register', async(req, res)=>{
    let {username,email , password} = req.body
    try {
        let user = await User.findOne({email})
        if(user){
            return res.status(400).send({msg : "User already registered", isOk : false})
        }
        else {
            b.hash(password, 8, async (err, result)=>{
                if(err){
                    console.log(err)
                    return res.status(400).send({msg : "Something went wrong !", isOk : false }) 
                }
                else{
                    let user = new User({username,email, password : result})
                    await user.save()
                    return res.status(200).send({msg : "Registeration Successful", isOk : true, user  : user})
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({msg : "Something went wrong- !", isOk : false })
    }
})


t_user_router.post('/verify',async(req, res)=>{
    const token = req.body.token;
    try {
        // console.log(token)
        const decoded = jwt.verify(token, process.env.secretKey);
        
        if (decoded.exp > Date.now() / 1000) {
            // console.log('hh')
            return res.status(200).json({isexpired:false})
        } else {
            // console.log('nn')
            return res.status(400).json({isexpired:true})
        }
    } catch (error) {
        // console.log(error)
        return res.status(400).json({msg:'something went wrong!', isexpired:true})
    }
})


module.exports = {t_user_router}
