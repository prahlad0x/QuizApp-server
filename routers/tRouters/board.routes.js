const express = require('express');
const task_board_router = express.Router();
const Board = require('../../models/tModels/board.model');

// Board Routes
task_board_router.get('/boards', async (req, res) => {
  try {
    const boards = await Board.find();
    res.json({boards, isOk : true});
  } catch (err) {
    res.status(500).json({ message: err.message, isOk : false });
  }
});

task_board_router.get('/boards/:boardId', async(req, res)=>{
  try {
    const board = await Board.findById(req.params.boardId).populate({
      path: 'tasks',
      populate: { path: 'subtasks' }
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found', isOk : false });
    }
    res.json({board, isOk : true});
  } catch (err) {
    res.status(500).json({ message: err.message, isOk : false });
  }

})

task_board_router.post('/boards',async (req, res) => {
  const { name } = req.body;
  const board = new Board({ name });
  try {
    const newBoard = await board.save();
    res.status(201).json({newBoard, isOk : true});
  } catch (err) {
    res.status(400).json({ message: err.message, isOk : false });
  }
});

task_board_router.put('/boards/:boardId', async(req, res) => {
  const { name } = req.body;
  try {
    const updatedBoard = await Board.findByIdAndUpdate(req.params.boardId, { name }, { new: true });
    res.json({updatedBoard, isOk : true});
  } catch (err) {
    res.status(400).json({ message: err.message, isOk : false });
  }
});

task_board_router.delete('/boards/:boardId', async(req, res) => {
  try {
    await Board.findByIdAndRemove(req.params.boardId);
    res.json({ message: 'Board deleted successfully' , isOk : true});
  } catch (err) {
    res.status(500).json({ message: err.message, isOk : false });
  }
});

module.exports = {task_board_router};
