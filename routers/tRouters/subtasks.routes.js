const express = require('express');
const task_subtasks_router = express.Router();
const Task = require('../../models/tModels/tasks.model');
const Subtask = require('../../models/tModels/subtask.model');
const Board = require('../../models/tModels/board.model');


// Subtask Routes
task_subtasks_router.get('/boards/:boardId/tasks/:taskId/subtasks', async (req, res) => {
    try {
      const subtasks = await Subtask.find({ taskId: req.params.taskId });
      res.json({subtasks, isOk : true});
    } catch (err) {
      res.status(500).json({ message: err.message, isOk : false });
    }
});
  
task_subtasks_router.get('/boards/:boardId/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
    try {
      const subtasks = await Subtask.findById(req.params.subtaskId);
      res.json({subtasks, isOk: true});
    } catch (err) {
      res.status(500).json({ message: err.message, isOk : false });
    }
});
  

task_subtasks_router.post('/boards/:boardId/tasks/:taskId/subtasks', async(req, res) => {
    const { title, isCompleted, email } = req.body;
    const subtask = new Subtask({
      title,
      isCompleted,
      taskId: req.params.taskId,
      user_email : email
    });
    try {
      const newSubtask = await subtask.save();
      await Task.findByIdAndUpdate(req.params.taskId, { $push: { subtasks: newSubtask._id } });
      res.status(201).json({newSubtask, isOk : true});
    } catch (err) {
      res.status(400).json({ message: err.message, isOk: false });
    }
});

task_subtasks_router.put('/boards/:boardId/tasks/:taskId/subtasks/:subtaskId', async(req, res) => {
    const { title, isCompleted,email } = req.body;
    try {
      const subtask = await Subtask.findById(req.params.subtaskId)
      if(subtask.user_email != email){
        return res.status(400).json({msg : "unauthorized", isOk : false})
      }

      const updatedSubtask = await Subtask.findByIdAndUpdate(
        req.params.subtaskId,
        { title, isCompleted },
        { new: true }
      );
      res.json({updatedSubtask, isOk : true});
    } catch (err) {
      res.status(400).json({ message: err.message, isOk: false });
    }
});


task_subtasks_router.put('/boards/:boardId/tasks/:taskId/subtasks', async(req, res) => {
  const { subtasks } = req.body;
  const {boardId, taskId} = req.params
  try {
    const updatedSubtasks = await Promise.all(
      subtasks.map(async (subtask) => {
        const {_id} = subtask
        // Use findOneAndUpdate to update a specific subtask based on its _id
        const updatedSubtask = await Subtask.findOneAndUpdate(
          {_id }, 
          { $set: subtask },
          { new: true }
        );

        return updatedSubtask;
      })
    );
    res.json({ updatedSubtasks, isOk: true });
  } catch (err) {
    console.log(err)
    res.status(400).json({ msg: err.message, isOk: false });
  }
});


task_subtasks_router.delete('/boards/:boardId/tasks/:taskId/subtasks/:subtaskId', async(req, res) => {
    try {
      const {email } = req.body
      const subtask = await Subtask.findById(req.params.subtaskId)
      if(subtask.user_email != email){
        return res.status(400).json({msg : "unauthorized", isOk : false})
      }
        await Subtask.findByIdAndRemove(req.params.subtaskId);
        await Task.findByIdAndUpdate(req.params.taskId, { $pull: { subtasks: req.params.subtaskId } });
        res.json({ message: 'Subtask deleted successfully', isOk : true });
      } catch (err) {
        res.status(500).json({ message: err.message, isOk : true });
      }
});

module.exports = {task_subtasks_router};
