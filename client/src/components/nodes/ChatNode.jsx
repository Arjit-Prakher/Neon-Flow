import { Handle, Position, useEdges, useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { generateResponse } from "../../utils/api";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';


const ChatNode = ({ id, data }) => {

    const { getNodes, getEdges, setNodes } = useReactFlow();
    const [message, setMessage] = useState(data?.message || '');
    const [response, setResponse] = useState(data?.response || '');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const edges = useEdges();
    const incomingEdge = edges.find(edge => edge.target === id);

    let dynamicTargetPosition = Position.Top;

    let dynamicSourceTop = Position.Top;
    let dynamicSourceRight = Position.Right;
    let dynamicSourceBottom = Position.Bottom;
    let dynamicSourceLeft = Position.Left;

    if (incomingEdge) {
        const sourceHandle = incomingEdge.sourceHandle;

        if (sourceHandle === 'source-bottom') {
            dynamicTargetPosition = Position.Top;
            dynamicSourceRight = Position.Right;
            dynamicSourceBottom = Position.Bottom;
            dynamicSourceLeft = Position.Left;

        } else if (sourceHandle === 'source-left') {

            dynamicTargetPosition = Position.Right;
            dynamicSourceTop = Position.Top;
            dynamicSourceRight = Position.Left;
            dynamicSourceBottom = Position.Bottom;

        } else if (sourceHandle === 'source-right') {

            dynamicTargetPosition = Position.Left;
            dynamicSourceTop = Position.Top;
            dynamicSourceRight = Position.Right;
            dynamicSourceBottom = Position.Bottom;

        } else if (sourceHandle === 'source-top') {

            dynamicTargetPosition = Position.Bottom;
            dynamicSourceTop = Position.Top;
            dynamicSourceRight = Position.Right;
            dynamicSourceLeft = Position.Left;
        }
    }


    useEffect(() => {
        if (data?.message !== undefined) setMessage(data.message);
        if (data?.response !== undefined) setResponse(data.response);
    }, [data.message, data.response]);

    const onChange = (event) => setMessage(event.target.value);
    const isGoDisabled = loading || Boolean(response);

    let showGoButton = false;
    if (message.length > 0) showGoButton = true;

    const getAncestryContext = () => {
        const nodes = getNodes();
        const edges = getEdges();
        const history = [];
        let currentNodeId = id;

        while (currentNodeId) {
            const parentEdge = edges.find((e) => e.target === currentNodeId);
            if (!parentEdge) break;

            const parentNode = nodes.find((n) => n.id === parentEdge.source);
            if (parentNode?.data?.message && parentNode?.data?.response) {
                history.unshift({ role: 'assistant', content: parentNode.data.response });
                history.unshift({ role: 'user', content: parentNode.data.message });
            }
            currentNodeId = parentEdge.source;
        }
        return history;
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setResponse("Thinking...");

        try {
            const history = getAncestryContext();
            // console.log(history);
            const aiReply = await generateResponse(message, history);
            setResponse(aiReply);
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === id
                        ? { ...node, data: { ...node.data, message, response: aiReply } }
                        : node
                )
            );
        } catch (err) {
            setResponse("Error: could not get response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: `70vw` }} className='initial-node bg-zinc-800 px-5 py-4 rounded-3xl w-140 border-4 border-pink-700 text-white'>
            <Handle type="target" position={dynamicTargetPosition} id="target-dynamic" />

            <Handle type="source" position={dynamicSourceTop} id="source-top" />
            <Handle type="source" position={dynamicSourceBottom} id="source-bottom" />
            <Handle type="source" position={dynamicSourceLeft} id="source-left" />
            <Handle type="source" position={dynamicSourceRight} id="source-right" />
            <div className='user-input-form mt-4'>
                <form onSubmit={onSubmit} className='flex items-center justify-between gap-1'>
                    <textarea
                        rows={2}
                        className='border rounded-2xl px-4 py-2 w-full overflow-hidden'
                        type="text"
                        placeholder='Shall we take it forward or dive deep..'
                        value={message}
                        onChange={onChange}
                    />
                    <button
                        type="submit"
                        disabled={isGoDisabled}
                        className={showGoButton ? 'cursor-pointer px-4 py-2 rounded-2xl border bg-linear-to-r from-pink-700 to-blue-700 hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed' : 'hidden'}
                    >Go</button>
                </form>
            </div>

            <div className='nowheel nodrag cursor-text select-text responses mt-4'>
                <div className={`markdown px-4 py-2 rounded-2xl ${expanded ? 'max-h-80 overflow-y-auto' : 'max-h-40 overflow-hidden'} custom-scrollbar`}>
                    {
                        loading ? (
                            <>
                                <p>Hang tight...</p>
                                <SkeletonTheme baseColor="#202020" highlightColor="#444444">
                                    <div className="space-y-2">
                                        <Skeleton width="60%" height={20} className="mb-2" />
                                        <Skeleton count={3} height={14} />
                                        <Skeleton width="40%" height={14} className="mt-2" />
                                    </div>
                                </SkeletonTheme>
                            </>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {loading ? "Loading..." : response || "Carry on... 😄"}
                            </ReactMarkdown>
                        )
                    }
                </div>
                {response && response.length > 200 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 text-sm text-pink-400 hover:underline cursor-pointer"
                    >
                        {expanded ? "Collapse" : "Show more"}
                    </button>
                )}
            </div>
        </div>
    )

}
export default ChatNode
