import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Meetings from './pages/Meetings';
import Tasks from './pages/Tasks';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Caregando Sessão...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Application Layout Shell */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="flex h-screen bg-surface-light overflow-hidden">
                  <Sidebar />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/meetings" element={<Meetings />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
