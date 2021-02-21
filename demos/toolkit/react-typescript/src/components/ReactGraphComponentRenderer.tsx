/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import React, { useEffect, useRef, useState } from 'react'
import { EdgesSource, GraphBuilder, GraphComponent, HierarchicLayout, LayoutExecutor, NodesSource, TimeSpan } from 'yfiles';
import { EdgeData, GraphData, NodeData } from '../App';

/**
 * Creates and configures the {@link GraphBuilder}.
 * @return {GraphBuilderWithSources}, the graph builder alongside with its edge sources and node sources.
 */
interface GraphBuilderWithSources {
    nodesSource: NodesSource<NodeData>
    edgesSource: EdgesSource<EdgeData>
    builder: GraphBuilder
}

const createGraphBuilder = (graphComponent: GraphComponent, graphData: GraphData): GraphBuilderWithSources => {
    const graphBuilder = new GraphBuilder(graphComponent.graph);
    const nodesSource = graphBuilder.createNodesSource({
        // Stores the nodes of the graph
        data: graphData.nodesSource,
        // Identifies the id property of a node object
        id: 'id',
        // Use the 'name' property as node label
        tag: item => ({ name: item.name })
    });
    const edgesSource = graphBuilder.createEdgesSource({
        // Stores the edges of the graph
        data: graphData.edgesSource,
        // Identifies the property of an edge object that contains the source node's id
        sourceId: 'fromNode',
        // Identifies the property of an edge object that contains the target node's id
        targetId: 'toNode'
    });
    return {
        nodesSource: nodesSource,
        edgesSource: edgesSource,
        builder: graphBuilder
    };
}

/**
 * A custom hook which automatically updates and draws the graph (in an animated way).
 * @param graphComponent the underlying graph component (Note: this is not a React Component)
 * @param graphBuilderWithSources the data to be updated (@see createGraphBuilder)
 * @param graphData the update (the latest change to edges and nodes)
 */
const useUpdateGraph = (graphComponent: GraphComponent, graphBuilderWithSources: GraphBuilderWithSources, graphData: GraphData): void => {

    const updateAndAnimate = async (newGraphData: GraphData) => {
        // update the graph data
        graphBuilderWithSources.builder.setData(graphBuilderWithSources.nodesSource, newGraphData.nodesSource)
        graphBuilderWithSources.builder.setData(graphBuilderWithSources.edgesSource, newGraphData.edgesSource)

        graphBuilderWithSources.builder.updateGraph()
        // apply a layout to re-arrange the new elements
        const layoutExecutor = new LayoutExecutor(graphComponent, new HierarchicLayout())
        layoutExecutor.duration = TimeSpan.fromSeconds(1)
        layoutExecutor.easedAnimation = true
        layoutExecutor.animateViewport = true
        await layoutExecutor.start()

        // finally, make sure that the graph is centered
        graphComponent.fitGraphBounds();
    }

    useEffect(() => {
        // pass the data update to the update function
        updateAndAnimate(graphData).catch(e => alert(e))
        // only re-render this function, if the input parameter changes; ignore warnings for other dependencies
    }, [graphData]); // eslint-disable-line
}

interface ReactGraphComponentRendererProps {
    graphComponent: GraphComponent
    graphData: GraphData
}

/**
 * A component which renders and animates a given graph component with given data
 * @param ReactGraphComponentRendererProps
 */
const GraphComponentWrapper: React.FunctionComponent<ReactGraphComponentRendererProps> = (props: ReactGraphComponentRendererProps) => {
    const div = useRef<HTMLDivElement>(null);
    const [graphBuilderInUse] = useState<GraphBuilderWithSources>(() => createGraphBuilder(props.graphComponent, props.graphData));
    // on initial load, append graph to ref
    useEffect(() => {
        div.current!.appendChild(props.graphComponent.div);
    });
    // updateGraph on props change (== change on graphData)
    useUpdateGraph(props.graphComponent, graphBuilderInUse, props.graphData,);
    // return the JSX
    return (
        <div className="graph-component-container" ref={div} />
    )
}
export default GraphComponentWrapper;
