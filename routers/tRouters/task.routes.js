const express = require('express');
const task_tasks_router = express.Router();
const Board = require('../../models/tModels/board.model');
const Task = require('../../models/tModels/tasks.model');

task_tasks_router.get('/boards/:boardId/tasks', async(req, res) => {
    try {
      const tasks = await Task.find({ boardId: req.params.boardId });
      res.json({tasks, isOk:true});
    } catch (err) {
      res.status(500).json({ message: err.message, isOk : false });
    }
});

task_tasks_router.get('/boards/:boardId/tasks/:taskId', async(req, res) => {
    try {
        const tasks = await Task.findById(req.params.taskId)
        res.json({tasks, isOk : true});
      } catch (err) {
        res.status(500).json({ message: err.message, isOk : false });
      }
});
  
task_tasks_router.post('/boards/:boardId/tasks', async(req, res) => {
    const { title, description, status,subtasks, email } = req.body;
    const newTask = new Task({
      title,
      description,
      status,
      boardId: req.params.boardId,
      user_email : email, 
      subtasks : subtasks
    });

    try {
      const savedTask = await newTask.save();
      await Board.findByIdAndUpdate(req.params.boardId, { $push: { tasks: savedTask._id } });
      res.status(201).json({savedTask , isOk : true});
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message, isOk : false });
    }
});

task_tasks_router.put('/boards/:boardId/tasks/:taskId', async(req, res) => {
    const { title, description, status ,subtasks, email} = req.body;
    try {
      const task = await Task.findById(req.params.taskId)
      if(task.user_email != email){
        return res.status(400).json({message : Unauthorized, isOk : false})
      }
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.taskId,
        { title, description, status,subtasks },
        { new: true }
      );
      res.json({updatedTask, isOk : true});
    } catch (err) {
      res.status(400).json({ message: err.message, isOk : false });
    }
});

task_tasks_router.delete('/boards/:boardId/tasks/:taskId', async(req, res) => {
    try {
      const {email} = req.body
      const task = await Task.findById(req.params.taskId)
      if(task.user_email != email){
        return res.status(400).json({message : Unauthorized, isOk : false})
      }

      await Task.findByIdAndRemove(req.params.taskId);
      await Board.findByIdAndUpdate(req.params.boardId, { $pull: { tasks: req.params.taskId } });
        res.json({ message: 'Task deleted successfully', isOk : true });
      } catch (err) {
        res.status(500).json({ message: err.message, isOk : false });
      }
});

module.exports={task_tasks_router}
  