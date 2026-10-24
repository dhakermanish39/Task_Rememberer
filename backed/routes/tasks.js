const express = require('express');
const Task = require('../models/Task');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Get all tasks of logged-in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ position: 1, createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (added at the bottom of its column)
router.post('/', async (req, res) => {
  try {
    const { title, description, status = 'todo', priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });

    const last = await Task.findOne({ user: req.user._id, status }).sort({ position: -1 });
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      position: last ? last.position + 1 : 0,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk reorder after drag & drop. Declared BEFORE '/:id' on purpose.
// body: { updates: [{ id, status, position }] }
router.put('/reorder/bulk', async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ message: 'updates array required' });

    const ops = updates.map((u) => ({
      updateOne: {
        filter: { _id: u.id, user: req.user._id },
        update: { $set: { status: u.status, position: u.position } },
      },
    }));
    if (ops.length) await Task.bulkWrite(ops);
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    });
    if (data.dueDate === '') data.dueDate = null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      data,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
