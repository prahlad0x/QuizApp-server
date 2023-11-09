const express = require('express');
const task_subtasks_router = express.Router();
const Task = require('../../models/tModels/tasks.model');
const Subtask = require('../../models/tModels/subtask.model');

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
    const { title, isCompleted } = req.body;
    const subtask = new Subtask({
      title,
      isCompleted,
      taskId: req.params.taskId,
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
    const { title, isCompleted } = req.body;
    try {
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

task_subtasks_router.delete('/boards/:boardId/tasks/:taskId/subtasks/:subtaskId', async(req, res) => {
    try {
        await Subtask.findByIdAndRemove(req.params.subtaskId);
        await Task.findByIdAndUpdate(req.params.taskId, { $pull: { subtasks: req.params.subtaskId } });
        res.json({ message: 'Subtask deleted successfully', isOk : true });
      } catch (err) {
        res.status(500).json({ message: err.message, isOk : true });
      }
});

module.exports = {task_subtasks_router};
