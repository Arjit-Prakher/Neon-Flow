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
import { resolveCollisions } from '../components/collision/resolve-collisions'

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

const DRAFT_FLOW_STORAGE_KEY = "neonflow.currentDraft";
const ACTIVE_FLOW_STORAGE_KEY = "neonflow.activeFlowId";

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
        if (nodes.length === 0) return;

        const timeout = setTimeout(() => {
            saveCurrentFlow();

            const draft = {
                nodes,
                edges,
                messages,
                activeFlowId,
                updatedAt: Date.now(),
            };
            localStorage.setItem(DRAFT_FLOW_STORAGE_KEY, JSON.stringify(draft));
        }, 500);

        return () => clearTimeout(timeout);
    }, [nodes, edges, messages, activeFlowId]);

    useEffect(() => {
        const fetchActiveFlow = async () => {
            if (token && activeFlowId) {
                const res = await fetch(`http://localhost:4000/api/flows/${activeFlowId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const flow = await res.json();
                localStorage.setItem(ACTIVE_FLOW_STORAGE_KEY, flow._id);
                if (res.ok) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                    setMessages(flow.messages);
                }
            }
        };
        fetchActiveFlow();
    }, [token, activeFlowId]);

    useEffect(() => {
        const draftJSON = localStorage.getItem(DRAFT_FLOW_STORAGE_KEY);
        const savedActive = localStorage.getItem(ACTIVE_FLOW_STORAGE_KEY);
        if (draftJSON) {
            try {
                const draft = JSON.parse(draftJSON);
                if (draft.nodes?.length) setNodes(draft.nodes);
                if (draft.edges) setEdges(draft.edges);
                if (draft.messages) setMessages(draft.messages);
                if (draft.activeFlowId) setActiveFlowId(draft.activeFlowId);
            } catch (error) {
                console.error("Failed to restore draft flow:", err);
            }
        } else if (savedActive) {
            setActiveFlowId(savedActive);
        }

    }, []);


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
                if (!activeFlowId) {
                    setActiveFlowId(savedFlow._id);
                    localStorage.setItem(ACTIVE_FLOW_STORAGE_KEY, savedFlow._id);
                }
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

                // setNodes((nds) => nds.concat(newNode));
                setNodes((nds) => {
                    const updated = nds.concat(newNode);
                    return resolveCollisions(updated, {
                        maxIterations: Infinity,
                        overlapThreshold: 0.5,
                        margin: 15,
                    });
                });

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

    const onNodeDragStop = useCallback(() => {
        setNodes((nds) => resolveCollisions(nds, {
            maxIterations: 20,
            overlapThreshold: 0.5,
            margin: 15,
        }));
    }, []);

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

        localStorage.removeItem(DRAFT_FLOW_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_FLOW_STORAGE_KEY);
    }

    return (
        <div className='w-full h-screen flex items-stretch overflow-hidden'>


            <div className={`sidebar-container relative transition-all duration-300 ease-in-out h-screen ${isSidebarOpen ? "w-96" : "w-20"}`}>
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
            <div className='canvas-ground relative flex-1 h-screen bg-[#0c101b] overflow-hidden'>
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
                    onNodeDragStop={onNodeDragStop}
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
