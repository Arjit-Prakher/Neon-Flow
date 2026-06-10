import React from 'react'
import workspaceImg from '../assets/workspaceImg.png' // add your workspace screenshot here

const Body = () => {
  return (
    <main className="flex flex-col items-center justify-center grow text-center px-6">
      {/* Hero Section */}
      <h2 className="mt-10 text-5xl font-extrabold bg-linear-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-6">
        AI on Canvas
      </h2>
      <p className="text-lg text-gray-300 max-w-2xl mb-10">
        Break free from the linear scroll of traditional chatbots. 
        Neon Flow introduces <span className="font-semibold text-pink-300">Spatial Intelligence</span>, 
        allowing you to branch ideas, explore “what‑ifs,” and visualize thoughts 
        on an infinite node‑based canvas.
      </p>
      <p className='mb-3 font-extrabold bg-linear-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent'>
        #stopscrollingstartflowing
      </p>

      {/* Workspace Preview */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-lg p-8 mb-16 max-w-4xl">
        <img src={workspaceImg} alt="Workspace Preview" className="rounded-xl shadow-lg mb-6" />
        {/* <img src="" alt="Workspace Preview" className="rounded-xl shadow-lg mb-6" /> */}
        <h3 className="text-2xl font-bold text-pink-300 mb-4">Your Workspace</h3>
        <p className="text-gray-300">
          A dynamic canvas where conversations become nodes. Connect, branch, and 
          revisit ideas seamlessly — making research and study workflows more intuitive 
          and engaging.
        </p>
      </div>

      {/* AI Engine Overview */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-lg p-8 max-w-4xl">
        <h3 className="text-2xl font-bold text-blue-300 mb-4">Powered by Gemini‑3‑Flash</h3>
        <p className="text-gray-300">
          At the backend, Neon Flow integrates <span className="font-semibold text-blue-400">Gemini‑3‑Flash</span>, 
          a high‑performance language model designed for speed and reliability. 
          It ensures context‑aware responses, enabling deeper exploration without 
          losing focus — the perfect companion for your spatial conversations.
        </p>
      </div>
    </main>
  )
}

export default Body

