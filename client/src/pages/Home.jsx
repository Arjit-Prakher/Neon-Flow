import InitialNode from '../components/nodes/InitialNode'
import Sidebar from '../components/Sidebar'
import FlowCanvas from '../components/FlowCanvas'
import { addEdge, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import ChatNode from '../components/nodes/ChatNode'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useState } from 'react'
import CustomEdge from '../components/custom-edge/CustomEdge'
import { useAuth } from '../context/AuthContext'
import NodeFinder from '../components/NodeFinder'

const nodeTypes = {
    greetings: InitialNode,
    chat: ChatNode
}
const edgeTypes = {
    'custom-edge': CustomEdge
}


const initialNode = [
    {
        id: 'welcome-node-1',
        type: 'greetings',
        position: { x: 50, y: 10 },
    }
]


const Home = () => {

    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [activeFlowId, setActiveFlowId] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNode);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition, fitView, setCenter } = useReactFlow();
    const [messages, setMessages] = useState([]);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(() => {
            const saved = localStorage.getItem(
                "sidebar"
            );

            return saved
                ? JSON.parse(saved)
                : true;
        });

    // Debounced save when nodes/edges/messages change
    useEffect(() => {
        if (nodes.length > 0) {
            const timeout = setTimeout(() => {
                saveCurrentFlow();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [nodes, edges, messages]);

    useEffect(() => {
        const fetchActiveFlow = async () => {
            if (token && activeFlowId) {
                const res = await fetch(`http://localhost:4000/api/flows/${activeFlowId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const flow = await res.json();
                if (res.ok) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                    setMessages(flow.messages);
                }
            }
        };
        fetchActiveFlow();
    }, [token, activeFlowId]);


    // 1. LOAD: Fetch all user flows when the page opens
    useEffect(() => {
        const fetchFlows = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/flows', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setHistory(data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };
        if (token) fetchFlows();
    }, [token]);

    // 2. SAVE: Send the current canvas to MongoDB
    const saveCurrentFlow = async () => {
        // Save when there's any chat node OR when the initial greetings node has a response
        const hasChatOrInitialResponse = nodes.some(node =>
            node.type === 'chat' || (node.type === 'greetings' && node.data?.response)
        );
        if (!hasChatOrInitialResponse) return;

        const flowData = {
            title: nodes[0]?.data?.title?.substring(0, 20) || "New Flow",
            nodes,
            edges,
            messages
        };

        try {
            const method = activeFlowId ? 'PUT' : 'POST';
            const url = activeFlowId
                ? `http://localhost:4000/api/flows/${activeFlowId}`
                : 'http://localhost:4000/api/flows';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(flowData)
            });

            const savedFlow = await res.json();
            if (res.ok) {
                setHistory(prev => {
                    const index = prev.findIndex(f => f._id === savedFlow._id);
                    if (index !== -1) {
                        const newHist = [...prev];
                        newHist[index] = savedFlow;
                        return newHist;
                    }
                    return [...prev, savedFlow];
                });
                if (!activeFlowId) setActiveFlowId(savedFlow._id);
                return savedFlow;
            }
        } catch (err) {
            console.error("Error saving flow:", err);
        }
    };

    const onConnect = useCallback(
        (params) => setEdges((edge) => addEdge(params, edge)),
        []
    );

    const onConnectEnd = useCallback(
        (event, connectionState) => {
            if (!connectionState.isValid) {
                const id = nanoid();
                const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;

                const newNode = {
                    id,
                    type: 'chat',
                    position: screenToFlowPosition({ x: clientX, y: clientY }),
                    data: { message: '', response: '' },
                    origin: [0.5, 0.0],
                };

                setNodes((nds) => nds.concat(newNode));

                setEdges((eds) =>
                    eds.concat({
                        id: nanoid(),
                        source: connectionState.fromNode.id,
                        sourceHandle: connectionState.fromHandle.id,
                        target: id,
                        type: 'custom-edge',
                    })
                );
            }
        },
        [screenToFlowPosition]
    )

    const handleNodeClick = useCallback(
        (_, node) => {
            fitView({ nodes: [node], duration: 800 })
        },
        [fitView]
    )

    const handleNewFlow = async () => {
        if (nodes.some(n => n.data?.message !== '')) {
            await saveCurrentFlow();
        }

        setNodes(initialNode);
        setEdges([]);
        setMessages([]);
        setActiveFlowId(null);

        // Center the initial node immediately so users see it in front
        setTimeout(() => {
            try {
                fitView({ padding: 0.2 });
            } catch (err) {
                // ignore if fitView isn't ready yet
            }
        }, 50);
    }
// console.log("in home.jsx: ", messages.length)

    return (
        <div className='container w-screen h-screen flex items-center justify-center'>


            <div className='sidebar-container'>
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    onNewFlow={handleNewFlow}
                    history={history}
                    setHistory={setHistory}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    activeFlowId={activeFlowId}
                    setActiveFlowId={setActiveFlowId}
                    setMessages={setMessages}
                    initialNode={initialNode}
                />
            </div>
            <div className='canvas-ground h-screen w-screen bg-[#0c101b]'>
                <FlowCanvas
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectEnd={onConnectEnd}
                    handleNodeClick={handleNodeClick}

                    setNodes={setNodes}
                    messages={messages}
                    setMessages={setMessages}
                />

            </div>

            <div className='node-finder absolute right-4 top-1/2 -translate-y-1/2 z-30'>
                <NodeFinder
                    nodes={nodes}
                    setCenter={setCenter}
                    fitView={fitView}
                />
            </div>
        </div>
    )
}
// This work belongs to Arjit Prakher
export default Home
