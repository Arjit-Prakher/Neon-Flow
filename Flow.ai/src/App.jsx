// import { ReactFlowProvider } from "@xyflow/react";
// import Home from './pages/Home'
// // import { ChatProvider } from "./hooks/ChatProvider";

// const App = () => {
//   return (
//     <ReactFlowProvider>
//         <Home />

//     </ReactFlowProvider>


//   )
// }

// export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import { ReactFlowProvider } from '@xyflow/react';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
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

export default App;