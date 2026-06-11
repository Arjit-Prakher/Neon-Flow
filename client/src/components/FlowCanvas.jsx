import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"



const FlowCanvas = ({ nodes, edges, nodeTypes, edgeTypes, onNodesChange, onEdgesChange, onConnect, onConnectEnd, handleNodeClick }) => {
  // console.log(edges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onConnectEnd={onConnectEnd}
    >
      
      <Controls position="top-right" showInteractive={false}/>
      {/* <MiniMap bgColor="#151a28" pannable zoomable/> */}
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