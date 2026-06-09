import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import { ReactFlowProvider } from '@xyflow/react';
import NeonFlow from './pages/NeonFlow';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<NeonFlow />} />
          <Route path='/auth' element={<Landing />}/>
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <ReactFlowProvider>

                  <Home />
                </ReactFlowProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
// This work belongs to Arjit Prakher
export default App;