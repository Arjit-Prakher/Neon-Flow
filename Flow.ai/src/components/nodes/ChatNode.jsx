import { Handle, Position, useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { generateResponse } from "../../utils/llm";
import ReactMarkdown from 'react-markdown';

const ChatNode = ({ id, data }) => {

    const { getNodes, getEdges, setNodes } = useReactFlow();
    const [message, setMessage] = useState(data?.message || '');
    const [response, setResponse] = useState(data?.response || '');
    const [loading, setLoading] = useState(false);

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (data?.message !== undefined) setMessage(data.message);
        if (data?.response !== undefined) setResponse(data.response);
    }, [data.message, data.response]);

    const onChange = (event) => setMessage(event.target.value);
    const isGoDisabled = loading || Boolean(response);

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
        <div className='initial-node bg-zinc-800 px-5 py-4 rounded-3xl w-140 border-4 border-pink-700 text-white'>

            <Handle type="target" position={Position.Top} id="target-top" />
            <Handle type="source" position={Position.Left} id="source-left" />
            <Handle type="source" position={Position.Right} id="source-right" />
            <Handle type="source" position={Position.Bottom} id="source-bottom" />
            <div className='user-input-form mt-4'>
                <form onSubmit={onSubmit} className='flex items-center justify-between gap-1'>
                    <textarea
                        rows={2}
                        className='border rounded-2xl px-4 py-2 w-full overflow-hidden'
                        type="text"
                        placeholder='Describe your message'
                        value={message}
                        onChange={onChange}
                    />
                    <button
                        type="submit"
                        disabled={isGoDisabled}
                        className='cursor-pointer px-4 py-2 rounded-2xl border bg-linear-to-r from-pink-700 to-blue-700 hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                    >Go</button>
                </form>
            </div>

            <div className='nowheel responses mt-4'>
                <div className={`markdown border px-4 py-2 rounded-2xl ${expanded ? 'max-h-80 overflow-y-auto' : 'max-h-40 overflow-hidden'} custom-scrollbar`}>
                    <ReactMarkdown>
                        {loading ? "Loading..." : response || "Responses will appear here..."}
                    </ReactMarkdown>
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
