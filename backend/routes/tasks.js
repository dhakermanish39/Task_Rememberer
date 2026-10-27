const express = require('express');
const supabase = require('../config/supabase');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Keep the same shape the React frontend already expects (_id, dueDate, ...)
const toTask = (t) => ({
  _id: t.id,
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  dueDate: t.due_date,
  position: t.position,
  createdAt: t.created_at,
});

// Get all tasks of logged-in user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data.map(toTask));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (added at the bottom of its column)
router.post('/', async (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });

    const { data: last } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', req.user.id)
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.user.id,
        title: title.trim(),
        description,
        status,
        priority,
        due_date: dueDate || null,
        position: last ? last.position + 1 : 0,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(toTask(data));
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

    const results = await Promise.all(
      updates.map((u) =>
        supabase
          .from('tasks')
          .update({ status: u.status, position: u.position, updated_at: new Date().toISOString() })
          .eq('id', u.id)
          .eq('user_id', req.user.id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const data = { updated_at: new Date().toISOString() };
    ['title', 'description', 'status', 'priority'].forEach((k) => {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    });
    if (req.body.dueDate !== undefined) data.due_date = req.body.dueDate || null;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(toTask(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id');
    if (error) throw error;
    if (!data.length) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
