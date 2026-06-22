import { Background, Controls, MiniMap, ReactFlow, useReactFlow } from "@xyflow/react"
import zoomIn from "../assets/zoom-in.png";
import zoomOut from "../assets/zoom-out.png";


const FlowCanvas = ({ nodes, edges, nodeTypes, edgeTypes, onNodeDragStop, onNodesChange, onEdgesChange, onConnect, onConnectEnd, handleNodeClick }) => {

  const { fitView } = useReactFlow();
  const handleZoomOut = () => {
    fitView({
      maxZoom: 0.5,
      duration: 150
    })
  }

  return (
    <ReactFlow className="w-full h-full"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onConnectEnd={onConnectEnd}
      onNodeDragStop={onNodeDragStop}
    >
      <div className="zoom-buttons bg-[#0e1b3c] p-2 border border-white rounded-md absolute z-10 top-5 right-2 flex flex-col gap-3">
        <div
          onClick={handleZoomOut}
          className="zoom-out h-6 w-6 cursor-pointer">
          <img src={zoomOut} alt="zoom-out" />
        </div>

      </div>
      {/* <Controls position="top-right" showInteractive={false} /> */}

      <svg>
        <linearGradient id="edge">
          <stop offset="0%" stopColor="#b71f6e" />
          <stop offset="100%" stopColor="#394ad7" />
        </linearGradient>
      </svg>
    </ReactFlow>
  )
}
// This work belongs to Arjit Prakher
export default FlowCanvas