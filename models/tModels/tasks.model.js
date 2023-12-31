const mongoose = require('mongoose');
const subtaskSchema = require('./subtask.model');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Todo', 'Doing', 'Done'],
    default: 'Todo',
  },
  user_email: {
    type: String,
    required: true,
  },
  subtasks: [{type:subtaskSchema}],
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
});

module.exports = mongoose.model('Task', taskSchema);
