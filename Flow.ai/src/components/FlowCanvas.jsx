import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"



const FlowCanvas = ({ nodes, edges, nodeTypes, edgeTypes, onNodesChange, onEdgesChange, onConnect, onConnectEnd }) => {
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
        onConnectEnd={onConnectEnd}
      >
        <Background />
        <Controls position="top-right" />
        <MiniMap bgColor="#151a28" pannable zoomable/>
      </ReactFlow>
  )
}

export default FlowCanvas