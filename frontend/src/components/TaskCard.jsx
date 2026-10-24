import { Draggable } from '@hello-pangea/dnd';

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

function dueInfo(dueDate, status) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = status !== 'done' && d < today;
  const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return { label, overdue };
}

export default function TaskCard({ task, index, onEdit, onDelete, dragDisabled }) {
  const due = dueInfo(task.dueDate, task.status);

  return (
    <Draggable draggableId={task._id} index={index} isDragDisabled={dragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card prio-${task.priority} ${snapshot.isDragging ? 'dragging' : ''}`}
          onDoubleClick={() => onEdit(task)}
        >
          <div className="card-title">{task.title}</div>
          {task.description && <p className="card-desc">{task.description}</p>}
          <div className="card-meta">
            <span className={`chip chip-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
            {due && <span className={`due ${due.overdue ? 'overdue' : ''}`}>{due.overdue ? 'Overdue: ' : 'Due '}{due.label}</span>}
            <span className="card-actions">
              <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task">Edit</button>
              <button type="button" className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete task">Delete</button>
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
