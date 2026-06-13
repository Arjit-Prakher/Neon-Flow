import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { generateResponse, generateFlowTitle } from "../../utils/api";
import ReactMarkdown from "react-markdown";

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const InitialNode = ({ id, data }) => {

    const { setNodes } = useReactFlow();
    const [message, setMessage] = useState(data?.message || '');
    const [response, setResponse] = useState(data?.response || '');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);


    const user = localStorage.getItem('user').split('@')[0];

    useEffect(() => {
        setMessage(data?.message || '');
        setResponse(data?.response || '');
        setTitle(data?.title || '');
    }, [data, id]);

    const onChange = (event) => setMessage(event.target.value);
    const isGoDisabled = loading || Boolean(response);
    let showGoButton = false;
    if (message.length > 0) showGoButton = true;

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            let aiTitle = title;
            const [fetchedTitle, aiReply] = await Promise.all([
                !aiTitle ? generateFlowTitle(message) : Promise.resolve(aiTitle),
                generateResponse(message, [], {})
            ]);
            aiTitle = fetchedTitle;
            setTitle(aiTitle);
            setResponse(aiReply);

            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                message,
                                response: aiReply,
                                title: aiTitle,
                            },
                        };
                    }
                    return node;
                })
            );
        } catch (err) {
            setResponse("Error starting flow.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div style={{ width: '70vw' }} className='nowheel initial-node bg-[#151a28] px-5 py-4 rounded-2xl border-4 border-sky-400 text-white'>

            <Handle type="source" position={Position.Bottom} id="source-bottom" />

            <div className='greetings mt-4 flex flex-col items-center'>
                <h1 className='text-3xl bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-extrabold'>Hi, {user.charAt(0).toUpperCase() + user.slice(1)}!</h1>
                <h3 className="markdown text-md mt-3">
                    <ReactMarkdown>

                        {title || "What should we dive into today!"}
                    </ReactMarkdown>
                </h3>

            </div>

            <div className='nodrag user-input-form mt-4'>
                <form onSubmit={onSubmit} className='flex items-center justify-between gap-1'>
                    <textarea
                        rows="1"
                        className='border rounded-2xl px-4 py-3 w-full overflow-hidden'
                        type="text"
                        placeholder='Describe your message'
                        value={message}
                        onChange={onChange}
                    />
                    <button
                        type="submit"
                        disabled={isGoDisabled}
                        className={showGoButton?'cursor-pointer px-4 py-2 rounded-2xl border bg-linear-to-r from-pink-700 to-blue-700 hover:scale-110 active:scale-90 transition-all' : 'hidden'}>
                        Go</button>
                </form>
            </div>

            <div className='nowheel nodrag cursor-text select-text responses mt-4'>
                <div
                    className={`markdown px-4 py-2 rounded-2xl ${expanded ? "max-h-80 overflow-y-auto" : "max-h-40 overflow-hidden"
                        } custom-scrollbar`}>
                    {loading ? (
                        <>
                            <p>Tailoring response..</p>
                            <SkeletonTheme baseColor="#202020" highlightColor="#444444">
                                <div className="space-y-2">
                                    <Skeleton width="60%" height={20} className="mb-2" />
                                    <Skeleton count={3} height={14} />
                                    <Skeleton width="40%" height={14} className="mt-2" />
                                </div>
                            </SkeletonTheme>
                        </>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {loading ? "Loading..." : response || "Waiting for your question 🤔"}
                        </ReactMarkdown>
                    )}
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