import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/*
  Landing page for Taskyard. Single file: styles are embedded below,
  so no change is needed in index.css.
  Place this file at: frontend/src/pages/Landing.jsx
*/

const COLUMNS = [
  { id: 0, title: 'To do' },
  { id: 1, title: 'In progress' },
  { id: 2, title: 'Done' },
];

const START_CARDS = [
  { id: 1, title: 'Design login screen', prio: 'high', col: 0 },
  { id: 2, title: 'Write API docs', prio: 'low', col: 0 },
  { id: 3, title: 'Fix cart bug', prio: 'medium', col: 1 },
  { id: 4, title: 'Set up database', prio: 'medium', col: 2 },
];

const FEATURES = [
  {
    title: 'Drag and drop',
    text: 'Move a task between columns or reorder it inside one. The new order is saved to your account.',
  },
  {
    title: 'Priorities and due dates',
    text: 'Mark tasks low, medium or high priority. Overdue tasks turn red so nothing slips.',
  },
  {
    title: 'Search and filter',
    text: 'Find a task by its title or description, or show only the high priority ones.',
  },
  {
    title: 'Private to you',
    text: 'Sign up with email and password. Every task you add is visible only to you.',
  },
];

function DemoBoard() {
  const [cards, setCards] = useState(START_CARDS);

  const advance = (id) =>
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, col: (c.col + 1) % 3 } : c)));

  const done = cards.filter((c) => c.col === 2).length;

  return (
    <div className="lp-demo" aria-label="Interactive board preview">
      <div className="lp-demo-bar">
        <span>{done} of {cards.length} tasks done</span>
        <span className="lp-demo-hint">Click a card to move it</span>
      </div>
      <div className="lp-demo-cols">
        {COLUMNS.map((col) => (
          <div key={col.id} className={`lp-demo-col lp-col-${col.id}`}>
            <div className="lp-demo-col-head">
              {col.title}
              <b>{cards.filter((c) => c.col === col.id).length}</b>
            </div>
            {cards
              .filter((c) => c.col === col.id)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`lp-card lp-prio-${c.prio}`}
                  onClick={() => advance(c.id)}
                >
                  {c.title}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="lp">
      <style>{css}</style>

      <header className="lp-nav">
        <span className="lp-brand">Taskyard</span>
        <nav className="lp-nav-links">
          {user ? (
            <Link to="/app" className="lp-btn lp-btn-primary">Open your board</Link>
          ) : (
            <>
              <Link to="/login" className="lp-link">Log in</Link>
              <Link to="/register" className="lp-btn lp-btn-primary">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-text">
            <h1>Move work from to do to done.</h1>
            <p>
              Taskyard is a simple Kanban board for your own projects. Drag tasks across columns,
              set priorities and due dates, and see how much is finished at a glance.
            </p>
            <div className="lp-cta">
              {user ? (
                <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">Open your board</Link>
              ) : (
                <>
                  <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">Create free account</Link>
                  <Link to="/login" className="lp-btn lp-btn-lg">Log in</Link>
                </>
              )}
            </div>
          </div>
          <DemoBoard />
        </section>

        <section className="lp-features">
          <h2>Everything you need to keep a project moving</h2>
          <div className="lp-feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="lp-feature">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-final">
          <h2>Start with an empty board</h2>
          <p>It takes under a minute to sign up and add your first task.</p>
          <Link to={user ? '/app' : '/register'} className="lp-btn lp-btn-primary lp-btn-lg">
            {user ? 'Open your board' : 'Create free account'}
          </Link>
        </section>
      </main>

      <footer className="lp-footer">
        Built with React, Express and MongoDB.
      </footer>
    </div>
  );
}

const css = `
.lp {
  --lp-bg: #e8ecf3;
  --lp-surface: #ffffff;
  --lp-ink: #17202f;
  --lp-muted: #5d6b82;
  --lp-line: #d3dae6;
  --lp-accent: #3d56e8;
  --lp-todo: #dde3f0;
  --lp-progress: #fbe9c6;
  --lp-done: #d3ecdc;
  min-height: 100%;
  background: var(--lp-bg);
  color: var(--lp-ink);
}
.lp h1, .lp h2, .lp h3, .lp p { margin: 0; }
.lp a { text-decoration: none; }

.lp-nav {
  max-width: 1120px; margin: 0 auto; padding: 18px 24px;
  display: flex; justify-content: space-between; align-items: center;
}
.lp-brand { font-weight: 800; font-size: 22px; letter-spacing: -0.03em; }
.lp-nav-links { display: flex; align-items: center; gap: 16px; }
.lp-link { color: var(--lp-ink); font-weight: 600; }
.lp-link:hover { color: var(--lp-accent); }

.lp-btn {
  display: inline-block; padding: 9px 16px; border-radius: 8px;
  border: 1px solid var(--lp-line); background: var(--lp-surface);
  color: var(--lp-ink); font-weight: 700; cursor: pointer;
}
.lp-btn:hover { border-color: var(--lp-muted); }
.lp-btn-primary { background: var(--lp-accent); border-color: var(--lp-accent); color: #fff; }
.lp-btn-primary:hover { filter: brightness(1.08); border-color: var(--lp-accent); }
.lp-btn-lg { padding: 13px 22px; font-size: 16px; }
.lp a:focus-visible, .lp button:focus-visible { outline: 2px solid var(--lp-accent); outline-offset: 2px; }

/* hero */
.lp-hero {
  max-width: 1120px; margin: 0 auto; padding: 48px 24px 72px;
  display: grid; grid-template-columns: 1fr 1.15fr; gap: 48px; align-items: center;
}
.lp-hero-text h1 { font-size: clamp(36px, 5vw, 56px); line-height: 1.05; letter-spacing: -0.035em; font-weight: 800; }
.lp-hero-text p { margin-top: 18px; font-size: 18px; line-height: 1.6; color: var(--lp-muted); max-width: 46ch; }
.lp-cta { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }

/* demo board */
.lp-demo {
  background: var(--lp-surface); border: 1px solid var(--lp-line);
  border-radius: 16px; padding: 14px; box-shadow: 0 18px 40px rgba(23, 32, 47, 0.12);
}
.lp-demo-bar { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; padding: 2px 4px 12px; }
.lp-demo-hint { color: var(--lp-muted); font-weight: 600; }
.lp-demo-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.lp-demo-col { border-radius: 10px; padding: 8px; min-height: 190px; display: flex; flex-direction: column; gap: 8px; }
.lp-col-0 { background: var(--lp-todo); }
.lp-col-1 { background: var(--lp-progress); }
.lp-col-2 { background: var(--lp-done); }
.lp-demo-col-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; padding: 0 2px; }
.lp-card {
  text-align: left; font: inherit; font-size: 13px; font-weight: 700; color: var(--lp-ink);
  background: var(--lp-surface); border: 0; border-left: 4px solid var(--lp-line);
  border-radius: 8px; padding: 9px 10px; cursor: pointer;
  box-shadow: 0 1px 2px rgba(23, 32, 47, 0.1); transition: transform 0.12s;
}
.lp-card:hover { transform: translateY(-2px); }
.lp-prio-high { border-left-color: #d6453d; }
.lp-prio-medium { border-left-color: #c98a0b; }
.lp-prio-low { border-left-color: #2f8f5b; }

/* features */
.lp-features { background: var(--lp-surface); padding: 72px 24px; }
.lp-features h2, .lp-feature-grid { max-width: 1120px; margin-left: auto; margin-right: auto; }
.lp-features h2 { font-size: clamp(26px, 3.4vw, 36px); letter-spacing: -0.03em; max-width: 22ch; margin-left: max(0px, calc((100% - 1120px) / 2)); }
.lp-feature-grid { margin-top: 36px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
.lp-feature h3 { font-size: 17px; font-weight: 700; padding-top: 14px; border-top: 3px solid var(--lp-accent); }
.lp-feature p { margin-top: 8px; color: var(--lp-muted); line-height: 1.6; font-size: 15px; }

/* final cta */
.lp-final { text-align: center; padding: 80px 24px; display: grid; gap: 14px; justify-items: center; }
.lp-final h2 { font-size: clamp(26px, 3.4vw, 36px); letter-spacing: -0.03em; }
.lp-final p { color: var(--lp-muted); margin-bottom: 8px; }

.lp-footer { text-align: center; padding: 24px; color: var(--lp-muted); font-size: 14px; border-top: 1px solid var(--lp-line); }

@media (max-width: 900px) {
  .lp-hero { grid-template-columns: 1fr; gap: 36px; padding-top: 24px; }
  .lp-feature-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .lp-feature-grid { grid-template-columns: 1fr; }
  .lp-demo-cols { grid-template-columns: 1fr; }
  .lp-demo-col { min-height: 0; }
}
@media (prefers-reduced-motion: reduce) { .lp-card { transition: none; } }
`;
