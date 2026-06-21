import { Handle, Position, useEdges, useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { generateResponse } from "../../utils/api";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from "remark-gfm";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";


const ChatNode = ({ id, data }) => {

    const { getNodes, getEdges, setNodes } = useReactFlow();
    const [message, setMessage] = useState(data?.message || '');
    const [response, setResponse] = useState(data?.response || '');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(10);

        let filesProcessed = 0;
        const newFilesArray = [];

        files.forEach((file) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];

                newFilesArray.push({
                    id: `${file.name}-${Date.now()}`, // unique identification key for mapping/removal
                    name: file.name,
                    type: file.type,
                    base64: base64String
                });

                filesProcessed++;
                // Scale progress linearly based on how many files are fully converted
                setUploadProgress(Math.round((filesProcessed / files.length) * 100));

                if (filesProcessed === files.length) {
                    setTimeout(() => {
                        setAttachedFiles((prev) => [...prev, ...newFilesArray]);
                        setIsUploading(false);
                        setUploadProgress(0);
                    }, 300);
                }
            };

            reader.readAsDataURL(file);
        });
    };
    const removeFile = (fileIdToExclude) => {
        setAttachedFiles((prev) => prev.filter(file => file.id !== fileIdToExclude));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setResponse("Thinking...");

        const mediaPayload = attachedFiles.map(file => ({
            data: file.base64,
            mimeType: file.type
        }));

        try {
            const history = getAncestryContext();
            // console.log(history);
            const aiReply = await generateResponse(message, history, {
                attachments: mediaPayload
            });

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
        <div style={{ width: `70vw` }} className='initial-node p-5 rounded-3xl bg-[#0b1227] border border-slate-500 text-slate-200 shadow-xl'>
            
            <Handle type="target" position={dynamicTargetPosition} id="target-dynamic" />

            <Handle type="source" position={dynamicSourceTop} id="source-top" />
            <Handle type="source" position={dynamicSourceBottom} id="source-bottom" />
            <Handle type="source" position={dynamicSourceLeft} id="source-left" />
            <Handle type="source" position={dynamicSourceRight} id="source-right" />
            {/* <div className='user-input-form mt-4'>
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
            </div> */}
            <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-15">
                <div className="nodrag flex items-center gap-2 bg-[#161b2c] border border-slate-800 rounded-2xl px-3 py-2 focus-within:border-pink-500/50 transition-all">
                    <input
                        type="file"
                        id={`file-upload-${id}`}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf,text/plain,text/csv"
                        multiple
                        disabled={isGoDisabled}
                    />

                    <label
                        htmlFor={`file-upload-${id}`}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl border border-dashed border-slate-700 cursor-pointer bg-slate-900/50 hover:bg-slate-800 hover:border-pink-500 text-slate-400 hover:text-pink-400 transition-all duration-200 shrink-0 select-none active:scale-95 ${isGoDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        <p className="text-2xl" >+</p>
                    </label>

                    <input
                        className="w-full bg-transparent border-0 outline-hidden text-sm text-slate-200 placeholder-slate-500 focus:ring-0 py-1"
                        placeholder="What's on your mind?"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                    />

                    <button type="submit" disabled={isGoDisabled || !message.trim()} className="cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-xl border border-pink-500/30 bg-linear-to-r from-pink-700 to-blue-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Go
                    </button>
                </div>

                {isUploading && (
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden relative -mt-1.5">
                        <div className="bg-linear-to-r from-pink-500 to-sky-400 h-1 transition-all duration-150 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                )}

                {/* RENDER GRID COMPONENT FOR MULTIPLE CHIP BADGES */}
                {attachedFiles.length > 0 && (
                    <div className="flex gap-4 max-h-24 overflow-y-auto custom-scrollbar pr-1 -mt-1 animate-fadeIn">
                        {attachedFiles.map((file) => (
                            <div key={file.id} className="flex gap-6 items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
                                <div className="flex items-center gap-2 truncate max-w-[85%]">
                                    {file.type.startsWith('image/') ? (
                                        <p className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    ) : (
                                        <p className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                    )}
                                    <span className="truncate">{file.name}</span>
                                </div>
                                <button type="button" onClick={() => removeFile(file.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-0.5">
                                    <p className="text-2xl" >x</p>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </form>

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
                                remarkPlugins={[remarkGfm, remarkMath]} // Combine remark plugins here
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
