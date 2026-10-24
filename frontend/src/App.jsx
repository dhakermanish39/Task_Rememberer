import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Board from './pages/Board.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading your board...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Protected><Board /></Protected>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
