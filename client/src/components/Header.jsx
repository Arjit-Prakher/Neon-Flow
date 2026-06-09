import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="flex justify-between items-center px-10 py-6 backdrop-blur-md bg-white/10 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Neon Flow
            </h1>
            <nav className="flex gap-6">
                <button
                    onClick={() => navigate('/auth')}
                    className="px-4 py-2 rounded-lg bg-linear-to-r from-pink-500 to-blue-500 text-white font-semibold hover:scale-105 transition">
                    Get Started
                </button>
            </nav>
        </header>
    )
}

export default Header