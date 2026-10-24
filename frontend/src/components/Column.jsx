import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard.jsx';

export default function Column({ id, title, hint, tasks, onAdd, onEdit, onDelete, dragDisabled }) {
  return (
    <section className={`column col-${id}`}>
      <header className="column-head">
        <h2>{title}</h2>
        <span className="count">{tasks.length}</span>
      </header>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-body ${snapshot.isDraggingOver ? 'over' : ''}`}
          >
            {tasks.map((t, i) => (
              <TaskCard key={t._id} task={t} index={i} onEdit={onEdit} onDelete={onDelete} dragDisabled={dragDisabled} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && <p className="empty">{hint}</p>}
          </div>
        )}
      </Droppable>

      <button className="add-btn" onClick={() => onAdd(id)}>+ Add task</button>
    </section>
  );
}
