import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onNewFlow, history, setHistory, setNodes, setEdges, activeFlowId, setActiveFlowId, setMessages, initialNode }) => {

    const { logout, token } = useAuth();
    const user = localStorage.getItem('user');
    const navigate = useNavigate();

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
                }
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handlePayment = async () => {
        const res = await fetch('http://localhost:4000/api/payment/create-order', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const order = await res.json();

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Neon Flow Pro",
            order_id: order.id,
            handler: async (response) => {
                // 3. Verify on backend
                const verifyRes = await fetch('http://localhost:4000/api/payment/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(response)
                });
                if (verifyRes.ok) alert("Welcome to Pro!");
            },
            theme: { color: "#db2777" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };
    return (


        <aside className="h-screen w-72 bg-[#0f121a] border-r border-zinc-800 flex flex-col text-white">
            {/* Top Section: Actions */}
            <div className="p-4 flex flex-col gap-3">
                <button
                    onClick={onNewFlow}
                    className="w-full bg-pink-700 hover:bg-pink-600 p-3 rounded-xl font-bold transition-colors shadow-lg shadow-pink-900/20"
                >
                    + New Flow
                </button>
            </div>

            {/* Middle Section: History List */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Recent Flows</h3>
                <div className="flex flex-col gap-2">
                    {history.length > 0 ? (
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
                                    <div className="flex justify-between items-center w-full bg-rose-600 cursor-pointer transition-all active:scale-95">
                                        <span
                                            onClick={(e) => deleteFlow(e, flow._id)}
                                            className="hover:text-red-500 p-3"
                                        >
                                            🗑️
                                        </span>
                                    </div>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-zinc-600 italic">No history yet...</p>
                    )}
                </div>
            </div>

            <button
                onClick={handlePayment}
                className="relative group overflow-hidden px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-blue-500/50"
            >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-linear-to-r from-pink-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-linear-to-br from-pink-500 to-blue-600 shadow-[0_0_15px_rgba(219,39,119,0.4)]">
                            <span className="text-sm">⚡</span>
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-white tracking-wide">UPGRADE TO PRO</p>
                            <p className="text-[10px] text-zinc-400">Unlock Llama-3 70B</p>
                        </div>
                    </div>
                    <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </div>
            </button>

            {/* Bottom Section: Accounts */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-blue-500 flex items-center justify-center font-bold">

                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{user}</p>
                        <p className="text-[10px] text-pink-500 font-mono">FLOW_PRO</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full p-2 rounded-lg border border-zinc-800 hover:bg-red-900/20 hover:border-red-900 hover:text-red-400 text-xs text-zinc-500 transition-all font-medium"
                >
                    Logout Session
                </button>
            </div>
        </aside>
    );
}
// This work belongs to Arjit Prakher
export default Sidebar