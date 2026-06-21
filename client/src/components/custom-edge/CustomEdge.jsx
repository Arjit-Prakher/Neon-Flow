import { BaseEdge, getBezierPath, getSmoothStepPath } from '@xyflow/react'
import React from 'react'

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd }) => {

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
    })
    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{
                stroke: "url(#edge)",
                strokeWidth: 4,
                strokeLinecap: 'round'
            }} />

        </>
    )
}// This work belongs to Arjit Prakher

export default CustomEdge