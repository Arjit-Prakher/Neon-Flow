import React from 'react'

const Footer = () => {
  return (
    <footer className="flex justify-center items-center py-6 backdrop-blur-md bg-white/10 rounded-t-xl mt-10">
      <p className="text-gray-400">
        Contribute on 
        <a 
          href="https://github.com/Arjit-Prakher/Neon-Flow" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="ml-2 text-pink-400 hover:text-pink-300 font-semibold"
        >
          GitHub
        </a>
      </p>
    </footer>
  )
}

export default Footer
