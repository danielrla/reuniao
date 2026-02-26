import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Meetings from './pages/Meetings';
import Tasks from './pages/Tasks';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

// A mock auth guard
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true; // TODO: Hook up with Firebase Auth Context
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
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
  );
}

export default App;
