import { useEffect, useState } from 'react';

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskModal({ task, defaultStatus, onClose, onSave }) {
  const editing = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus || 'todo',
    priority: task?.priority || 'medium',
    dueDate: toInputDate(task?.dueDate),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Give the task a title');
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>{editing ? 'Edit task' : 'New task'}</h2>
        {error && <div className="error">{error}</div>}
        <label>Title
          <input autoFocus maxLength={120} value={form.title} onChange={set('title')} />
        </label>
        <label>Description
          <textarea rows={3} value={form.description} onChange={set('description')} />
        </label>
        <div className="row">
          <label>Status
            <select value={form.status} onChange={set('status')}>
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>Due date
            <input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </div>
  );
}
