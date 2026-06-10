import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          login(data);
          navigate('/app');
        }
        else {
          alert("Account created! Now please login.");
          setIsLogin(true);
        }
      } else {
        alert(data.message); // Show error (e.g., "User not found")
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
    // login("fake-jwt-token");
    // navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#0f121a] flex flex-col items-center justify-center font-sans text-white">
      {/* Neon Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full"></div>

      <div className="z-10 text-center mb-10">
        <h1 className="text-6xl font-black bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
          NEON FLOW
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">AI on Canvas</p>
      </div>

      <div className="z-10 bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border-2 border-zinc-800 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl focus:border-pink-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="mt-4 bg-linear-to-r from-pink-600 to-blue-600 p-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-pink-500 hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
// This work belongs to Arjit Prakher
export default Landing;