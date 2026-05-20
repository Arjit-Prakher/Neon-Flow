import InitialNode from '../components/nodes/InitialNode'
import Sidebar from '../components/Sidebar'
import FlowCanvas from '../components/FlowCanvas'
import { addEdge, MarkerType, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import ChatNode from '../components/nodes/ChatNode'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useState } from 'react'
import CustomEdge from '../components/custom-edge/CustomEdge'
import { useAuth } from '../context/AuthContext'

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
        position: { x: 300, y: 100 },
    }
]


const Home = () => {

    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [activeFlowId, setActiveFlowId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNode);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    console.log(nodes);
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
        // if (nodes.length <= 1 && !nodes[0]?.data?.message) return;

        const hasChatNode = nodes.some(node => node.type === 'chat');
        // console.log(hasChatNode);
        if (!hasChatNode) return;

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

    const handleNewFlow = async () => {

        // console.log(nodes);
        if (!nodes.data) {
            // console.log("yahi se return ho raha hai");
            setNodes(initialNode);
            setEdges([]);
            setMessages([]);
            setActiveFlowId(null);
            return;
        }
        if (nodes.some(n => n.data.message !== '')) {
            await saveCurrentFlow();
        }
        setNodes(initialNode);
        setEdges([]);
        setMessages([]);
        setActiveFlowId(null);
    }
    return (
        <>
            <div className='sidebar-container absolute z-10'>
                <Sidebar
                    onNewFlow={handleNewFlow}
                    history={history}
                    setHistory={setHistory}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    activeFlowId={activeFlowId}
                    setActiveFlowId={setActiveFlowId}
                    setMessages={setMessages} // Allow sidebar to load old messages
                    initialNode={initialNode}
                />
            </div>
            <div className='canvas-ground h-screen w-screen bg-[#151a28]'>
                <FlowCanvas
                    // key={activeFlowId || 'new'}
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectEnd={onConnectEnd}

                    setNodes={setNodes}
                    messages={messages}
                    setMessages={setMessages}
                />

            </div>
        </>
    )
}
// This work belongs to Arjit Prakher
export default Home