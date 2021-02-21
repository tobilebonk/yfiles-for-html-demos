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
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import {
  Arrow,
  DefaultLabelStyle,
  Font,
  GraphComponent,
  GraphViewerInputMode,
  ICommand,
  IModelItem,
  MouseHoverInputMode,
  Point,
  PolylineEdgeStyle,
  QueryItemToolTipEventArgs,
  Size,
  TimeSpan
} from 'yfiles'
import 'yfiles/yfiles.css'
import './ReactGraphComponent.css'
import ItemElement from './ItemElement'
import DemoToolbar from './DemoToolbar'
import { GraphData } from '../App'
import { ReactComponentNodeStyle } from './ReactComponentNodeStyle'
import NodeTemplate from './NodeTemplate'
import GraphComponentWrapper from './ReactGraphComponentRenderer'
import useLicense from '../hooks/useLicense'

interface ReactGraphComponentProps {
  graphData: GraphData
  onResetData(): void
}

const initGraphComponent = (): GraphComponent => {
  /**
   * Set ups the tooltips for nodes and edges.
   * @param {GraphViewerInputMode} inputMode
   */

  const initializeTooltips = (inputMode: GraphViewerInputMode): void => {
    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromSeconds(0.5)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener(
      (src: MouseHoverInputMode, args: QueryItemToolTipEventArgs<IModelItem>) => {
        if (args.handled) {
          // Tooltip content has already been assigned => nothing to do.
          return
        }

        // Re-use the React-Component to render the tooltip content
        const container = document.createElement('div')
        ReactDOM.render(<ItemElement item={args.item!.tag} />, container)
        args.toolTip = container

        // Indicate that the tooltip content has been set.
        args.handled = true
      }
    )
  }
  /**
   * Sets default styles for the graph.
   */
  const initializeDefaultStyles = (graphComponent: GraphComponent): void => {
    graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    graphComponent.graph.nodeDefaults.style = new ReactComponentNodeStyle<{ name?: string }>(
      NodeTemplate
    )
    graphComponent.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#fff',
      font: new Font('Robot, sans-serif', 14)
    })
    graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength: 25,
      stroke: '5px #242265',
      targetArrow: new Arrow({
        fill: '#242265',
        scale: 2,
        type: 'circle'
      })
    })
  }

  const graphComponent: GraphComponent = new GraphComponent();
  graphComponent.inputMode = new GraphViewerInputMode();
  initializeTooltips(graphComponent.inputMode as GraphViewerInputMode);
  initializeDefaultStyles(graphComponent);
  return graphComponent;
}


const ReactGraphComponent: React.FunctionComponent<ReactGraphComponentProps> = (props: ReactGraphComponentProps) => {
  // include the yFiles License (before graph creation)
  useLicense();
  // initialize read-only graph component
  const [graphComponent] = useState<GraphComponent>(() => initGraphComponent());

  return (
    <div>
      <div className="toolbar">
        <DemoToolbar
          resetData={props.onResetData}
          zoomIn={(): void => ICommand.INCREASE_ZOOM.execute(null, graphComponent)}
          zoomOut={(): void => ICommand.DECREASE_ZOOM.execute(null, graphComponent)}
          resetZoom={(): void => ICommand.ZOOM.execute(1.0, graphComponent)}
          fitContent={(): void => ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)}
        />
      </div>
      <GraphComponentWrapper graphComponent={graphComponent} graphData={props.graphData} />
    </div>
  )
}

export default ReactGraphComponent;
