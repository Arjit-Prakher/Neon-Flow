import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { generateResponse, generateFlowTitle } from "../../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

    const [attachedFiles, setAttachedFiles] = useState([]); // Holds array of { id, name, base64, type }
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);


    const user = localStorage.getItem('user').split('@')[0];

    useEffect(() => {
        setMessage(data?.message || '');
        setResponse(data?.response || '');
        setTitle(data?.title || '');
    }, [data, id]);

    const onChange = (event) => setMessage(event.target.value);

    const isGoDisabled = loading || isUploading || Boolean(response);
    let showGoButton = false;
    if (message.length > 0) showGoButton = true;

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

    // Remove a single targeted chip badge from the attachment pool
    const removeFile = (fileIdToExclude) => {
        setAttachedFiles((prev) => prev.filter(file => file.id !== fileIdToExclude));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            let aiTitle = title;
            if (!aiTitle) {
                aiTitle = await generateFlowTitle(message);
            }

            // Map files array down to the API parameters layer
            const mediaPayload = attachedFiles.map(file => ({
                data: file.base64,
                mimeType: file.type
            }));

            const aiReply = await generateResponse(message, [], {
                attachments: mediaPayload // Send unified array payload
            });

            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: { ...node.data, message, response: aiReply, title: aiTitle },
                        };
                    }
                    return node;
                })
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ width: '70vw' }} className='nowheel initial-node p-5 rounded-3xl bg-[#0f1422] border border-slate-500 text-slate-200 shadow-2xl'>

            
            <Handle type="source" position={Position.Bottom} id="source-bottom" />

            <div className='greetings mt-4 flex flex-col items-center'>
                <h1 className='text-3xl bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-extrabold'>Hi, {user.charAt(0).toUpperCase() + user.slice(1)}!</h1>
                <h3 className="markdown text-md mt-3">
                    <ReactMarkdown>

                        {title || "What should we dive into today!"}
                    </ReactMarkdown>
                </h3>

            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
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