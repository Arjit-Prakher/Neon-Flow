import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import dustbin from "../assets/dustbin.png";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/left-arrow.png";
import { useEffect, useState } from "react";

const Sidebar = ({ onNewFlow, history, setHistory, setNodes, setEdges, activeFlowId, setActiveFlowId, setMessages, initialNode, isOpen, setIsSidebarOpen }) => {

    const { logout, token } = useAuth();
    const user = localStorage.getItem('user');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("sidebar", JSON.stringify(isOpen));
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
    }
    const loadFlow = (flow) => {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setMessages(flow.messages || []);
        setActiveFlowId(flow._id);
    };

    const deleteFlow = async (e, flowId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this flow?")) return;

        try {
            const res = await fetch(`http://localhost:4000/api/flows/${flowId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setHistory(prev => prev.filter(f => f._id !== flowId));
                // if (activeFlowId === flowId) onNewFlow();
                if (activeFlowId === flowId) {
                    setNodes(initialNode);
                    setEdges([]);
                    setMessages([]);
                    setActiveFlowId(null);
                    // onNewFlow();
                }
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };


    return (


        <aside className={`transition-all duration-300 ease-in-out h-screen bg-[#0f121a] border-r border-zinc-800 flex flex-col text-white w-full`}>
            <button
                onClick={() => setIsSidebarOpen(!isOpen)}
                className={`text-2xl w-10 h-10 bg-[#0e1b3c] border border-white cursor-pointer flex items-center justify-center rounded-md font-extrabold absolute top-2 left-2`}>
                <img src={isOpen ? leftarrow : rightarrow} alt="" className="w-5" />
            </button>
            {/* Top Section: Actions */}
            <div className="p-4 flex flex-col gap-3 mt-10">
                <button
                    onClick={onNewFlow}
                    className="w-full bg-pink-700 hover:bg-pink-600 p-3 rounded-xl font-bold transition-colors shadow-lg shadow-pink-900/20"
                >
                    {isOpen ? "+ New Flow" : "+"}
                </button>
            </div>

            {/* Middle Section: History List */}

            {isOpen && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 custom-scrollbar">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Recent Flows</h3>
                    <div className="flex flex-col gap-2">
                        {
                            history.length > 0 ? (
                                history.map((flow, index) => (
                                    <div key={index} className="flex w-full items-center justify-between gap-2">
                                        <button
                                            key={flow._id}
                                            onClick={() => loadFlow(flow)}
                                            className={`w-full group text-left p-3 rounded-xl border transition-all
                                    ${activeFlowId === flow._id
                                                    ? "bg-pink-900/40 border-pink-500"
                                                    : "bg-zinc-900/50 border-zinc-800 hover:border-pink-500/50 hover:bg-zinc-800"}
                                    `}
                                        >
                                            <p className="text-sm font-medium truncate group-hover:text-pink-400">
                                                {flow.title || "Untitled Flow"}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 mt-1">
                                                {new Date(flow.updatedAt).toLocaleDateString()}
                                            </p>
                                        </button>
                                        <button onClick={() => loadFlow(flow)} className="...">
                                            <div
                                                onClick={(e) => deleteFlow(e, flow._id)}
                                                className="flex justify-between items-center w-full border border-white p-2 rounded-md bg-[#0e1b3c] cursor-pointer transition-all active:scale-95">

                                                <img src={dustbin} alt="" className="w-10" />

                                            </div>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-600 italic">No history yet...</p>
                            )
                        }
                    </div>
                </div>
            )}

            {/* Bottom Section: Accounts */}
            <div className={`${isOpen ? "p-4 border-t border-zinc-800 bg-zinc-900/30" : "absolute bottom-0 p-4 border-zinc-800 bg-zinc-900/30"}`}>
                <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-blue-500 flex items-center justify-center font-bold">
                        {user[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{isOpen ? user : ""}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg border border-zinc-800 hover:bg-red-900/20 hover:border-red-900 hover:text-red-400 text-xs text-zinc-500 transition-all font-medium"
                >
                    {isOpen ? "Logout Session" : "Logout"}
                </button>
            </div>
        </aside>
    );
}
// This work belongs to Arjit Prakher
export default Sidebar