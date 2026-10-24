import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Column from '../components/Column.jsx';
import TaskModal from '../components/TaskModal.jsx';

const COLUMNS = [
  { id: 'todo', title: 'To do', hint: 'Nothing queued. Add a task to get started.' },
  { id: 'inprogress', title: 'In progress', hint: 'Drag a task here when you start it.' },
  { id: 'done', title: 'Done', hint: 'Finished tasks land here.' },
];

export default function Board() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { task?, status? }
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');

  const load = useCallback(async () => {
    try {
      setTasks(await api.getTasks());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtering = search.trim() !== '' || priority !== 'all';

  // full ordered lists per column (used by drag logic)
  const byColumn = useMemo(() => {
    const map = { todo: [], inprogress: [], done: [] };
    [...tasks].sort((a, b) => a.position - b.position).forEach((t) => map[t.status]?.push(t));
    return map;
  }, [tasks]);

  // visible lists (filters applied)
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = {};
    for (const c of COLUMNS) {
      out[c.id] = byColumn[c.id].filter(
        (t) =>
          (priority === 'all' || t.priority === priority) &&
          (!q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      );
    }
    return out;
  }, [byColumn, search, priority]);

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const lists = { todo: [...byColumn.todo], inprogress: [...byColumn.inprogress], done: [...byColumn.done] };
    const [moved] = lists[source.droppableId].splice(source.index, 1);
    lists[destination.droppableId].splice(destination.index, 0, { ...moved, status: destination.droppableId });

    // only columns that changed need updating
    const touched = new Set([source.droppableId, destination.droppableId]);
    const updates = [];
    touched.forEach((col) =>
      lists[col].forEach((t, i) => updates.push({ id: t._id, status: col, position: i }))
    );

    // optimistic UI update
    const lookup = new Map(updates.map((u) => [u.id, u]));
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (lookup.has(t._id) ? { ...t, status: lookup.get(t._id).status, position: lookup.get(t._id).position } : t))
    );

    try {
      await api.reorder(updates);
    } catch (err) {
      setTasks(previous); // roll back
      setError(`Could not save the move: ${err.message}`);
    }
  };

  const saveTask = async (form) => {
    if (modal.task) {
      const updated = await api.updateTask(modal.task._id, form);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } else {
      const created = await api.createTask(form);
      setTasks((prev) => [...prev, created]);
    }
    setModal(null);
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const total = tasks.length;
  const done = byColumn.done.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Taskyard</div>
        <div className="top-right">
          <span className="muted">{user?.name}</span>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="toolbar">
        <div className="progress">
          <div className="progress-text">{done} of {total} tasks done</div>
          <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        </div>
        <input
          className="search"
          placeholder="Search tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn primary" onClick={() => setModal({ status: 'todo' })}>New task</button>
      </div>

      {filtering && <div className="notice">Filters are on, so drag and drop is paused. Clear them to reorder tasks.</div>}
      {error && <div className="error banner">{error}</div>}

      {loading ? (
        <div className="center-screen">Loading tasks...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <main className="board">
            {COLUMNS.map((c) => (
              <Column
                key={c.id}
                id={c.id}
                title={c.title}
                hint={filtering ? 'No tasks match the filters.' : c.hint}
                tasks={visible[c.id]}
                dragDisabled={filtering}
                onAdd={(status) => setModal({ status })}
                onEdit={(task) => setModal({ task })}
                onDelete={deleteTask}
              />
            ))}
          </main>
        </DragDropContext>
      )}

      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          onClose={() => setModal(null)}
          onSave={saveTask}
        />
      )}
    </div>
  );
}
