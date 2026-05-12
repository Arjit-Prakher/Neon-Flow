import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { generateFlowTitle, generateResponse } from "../../utils/llm";
import ReactMarkdown from "react-markdown";


const InitialNode = ({ id, data }) => {

    const { setNodes } = useReactFlow();
    const [message, setMessage] = useState(data?.message || '');
    const [response, setResponse] = useState(data?.response || '');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);


    const user = localStorage.getItem('user').split('@')[0];
    // console.log(user);
    // let username = email.split('@')[0]; 

    useEffect(() => {
        setMessage(data?.message || '');
        setResponse(data?.response || '');
    }, [data, id]);

    const onChange = (event) => setMessage(event.target.value);
    const isGoDisabled = loading || Boolean(response);

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const aiReply = await generateResponse(message); // No history needed for first node
            const aiTitle = await generateFlowTitle(message);
            setResponse(aiReply);
            setTitle(aiTitle);

            // 4. SAVE TO GRAPH so children can crawl this node
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === id
                        ? { ...node, data: { ...node.data, message, response: aiReply } }
                        : node
                )
            );
        } catch (err) {
            setResponse("Error starting flow.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className='initial-node bg-[#151a28] px-5 py-4 rounded-2xl w-150 border-4 border-sky-400 text-white'>
            <Handle type="source" position={Position.Bottom} id="source-bottom" />

            <div className='greetings mt-4'>
                <h1 className='text-5xl bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-extrabold'>Hi, {user}!</h1>
                <h3 className="markdown text-xl mt-3">
                    <ReactMarkdown>

                        {title || "What should we dive into today!"}
                    </ReactMarkdown>
                </h3>
            </div>

            <div className='user-input-form mt-4'>
                <form onSubmit={onSubmit} className='flex items-center justify-between gap-1'>
                    <textarea
                        rows="3"
                        className='border rounded-2xl px-4 py-2 w-full overflow-hidden'
                        type="text"
                        placeholder='Describe your message'
                        value={message}
                        onChange={onChange}
                    />
                    <button
                        type="submit"
                        disabled={isGoDisabled}
                        className='cursor-pointer px-4 py-2 rounded-2xl border bg-linear-to-r from-pink-700 to-blue-700 hover:scale-110 active:scale-90 transition-all'>
                        Go</button>
                </form>
            </div>

            <div className='nowheel responses mt-4'>
                {/* <p className="markdown border px-4 py-2 rounded-2xl">
                    <ReactMarkdown>
                        {response || "Responses will appear here..."}
                    </ReactMarkdown>
                </p> */}
                <div
                    className={`markdown border px-4 py-2 rounded-2xl ${expanded ? "max-h-80 overflow-y-auto" : "max-h-40 overflow-hidden"
                        } custom-scrollbar`}
                    onWheel={(e) => e.stopPropagation()} // prevent canvas zoom
                    onMouseDown={(e) => e.stopPropagation()} // prevent drag
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <ReactMarkdown>
                        {response || "Responses will appear here..."}
                    </ReactMarkdown>
                </div>
                {response && response.length > 200 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="mt-2 text-xs text-sky-400 hover:underline cursor-pointer"
                    >
                        {expanded ? "Collapse" : "Show more"}
                    </button>
                )}

            </div>


        </div>
    )
}

export default InitialNode