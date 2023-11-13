const express = require('express');
const task_tasks_router = express.Router();
const Board = require('../../models/tModels/board.model');
const Task = require('../../models/tModels/tasks.model');
const Subtask = require('../../models/tModels/subtask.model');

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
        const tasks = await Task.findById(req.params.taskId).populate({ path: 'subtasks' });
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
      user_email : email
    });

    try {
      const savedTask = await newTask.save();

      let subtask_ids = []
      
      async function subtask_adder(obj){
        const newSubtask = new Subtask(obj)
        const savedSubTask = await  newSubtask.save()
        subtask_ids.push(savedSubTask._id)
      }

      subtasks.forEach(element => {
        subtask_adder({title : element.title, user_email : email, taskId:savedTask._id })
      });

      const task_to_update  = await Task.findById(savedTask._id) 

      const subtask_id_arr = [...task_to_update.subtasks, ...subtask_ids]
      await Task.findByIdAndUpdate(savedTask._id, {subtasks :subtask_id_arr } );
      await Board.findByIdAndUpdate(req.params.boardId, { $push: { tasks: savedTask._id } });
      res.status(201).json({savedTask , isOk : true});
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message, isOk : false });
    }
});

task_tasks_router.put('/boards/:boardId/tasks/:taskId', async(req, res) => {
    const { title, description, status , email} = req.body;
    try {
      const task = await Task.findById(req.params.taskId)
      if(task.user_email != email){
        return res.status(400).json({message : Unauthorized, isOk : false})
      }
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.taskId,
        { title, description, status },
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
      await Subtask.deleteMany({ taskId: req.params.taskId });
      await Task.findByIdAndRemove(req.params.taskId);
      await Board.findByIdAndUpdate(req.params.boardId, { $pull: { tasks: req.params.taskId } });
        res.json({ message: 'Task deleted successfully', isOk : true });
      } catch (err) {
        res.status(500).json({ message: err.message, isOk : false });
      }
});

module.exports={task_tasks_router}
  