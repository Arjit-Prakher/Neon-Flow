import React, { useCallback } from 'react'
import { useState } from 'react';

const NodeFinder = ({ nodes, setCenter, fitView }) => {


    const [isHovered, setIsHovered] = useState(false);
    const validNodes = nodes.filter(node => node.data?.message && node.data.message.trim().length > 0);

    const handleNodeFocus = (node) => {
        fitView({ nodes: [node], duration: 800 })
    }

    return (
        <div
            className="flex items-center justify-end group"
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* The Expanded Message List Container */}
            {
                isHovered && validNodes.length === 0 && <div className='mr-3 bg-[#151a28]/95 backdrop-blur-md border border-slate-400/50 
                rounded-2xl p-4 w-72 max-h-96 overflow-y-auto custom-scrollbar shadow-2xl
                transition-all duration-300 transform origin-right text-xs font-bold tracking-wider text-slate-200 uppercase mb-3 px-1 text-center'>Explore your mind!</div>
            }
            <div className={`
                mr-3 bg-[#151a28]/95 backdrop-blur-md border border-slate-700/50 
                rounded-2xl p-4 w-72 max-h-96 overflow-y-auto custom-scrollbar shadow-2xl
                transition-all duration-300 transform origin-right
                ${isHovered && validNodes.length > 0
                    ? 'opacity-100 scale-100 translate-x-0'
                    : 'hidden scale-95 translate-x-4 pointer-events-none'}
            `}>


                <h4 className="text-xs font-bold tracking-wider text-slate-100 uppercase mb-3 px-1">
                    Canvas Nodes Map
                </h4>

                <div className="flex flex-col gap-1.5">
                    {validNodes.map((node) => {
                        const previewText = node.data.message.length > 45
                            ? `${node.data.message.slice(0, 45)}...`
                            : node.data.message;

                        return (
                            <div
                                key={node.id}
                                onClick={() => handleNodeFocus(node)}
                                className={`
                                    text-sm px-3 py-2 rounded-xl border border-transparent 
                                    bg-slate-800/40 hover:bg-[#3e5fba]/30 hover:border-[#3e5fba]/50
                                    cursor-pointer transition-all active:scale-[0.98]
                                    ${node.type === 'greetings' ? 'border-sky-500/20 text-sky-300' : 'text-slate-200'}
                                `}
                            >
                                <span className="block text-[10px] uppercase font-bold tracking-tight opacity-40 mb-0.5">
                                    {node.type === 'greetings' ? 'Initial Context' : 'Branch Node'}
                                </span>
                                <p className="line-clamp-2 leading-snug">{previewText}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* The Base Floating Target Circle Indicator */}
            <div
                onMouseEnter={() => setIsHovered(true)}

                className={`
                w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-xl
                transition-all duration-300 border-2 active:scale-95
                ${isHovered
                        ? 'bg-pink-700 border-pink-500 scale-110'
                        : 'bg-[#151a28] border-sky-400 hover:border-pink-500'}
            `}>
                <p
                    className={`w-5 h-5 text-white transition-transform duration-500 ${isHovered ? 'rotate-180 text-white' : 'text-sky-400 group-hover:text-pink-400'}`} />
            </div>
        </div>
    );
}

export default NodeFinder