import { useTheme } from "@mui/material"
import {
    BlockSvg,
    Events,
    IPositionable,
    MetricsManager,
    utils,
    WorkspaceSvg,
    TOOLBOX_AT_LEFT,
    Scrollbar,
    ComponentManager,
} from "blockly"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { svgPointerPoint } from "../widgets/svgutils"
import useWorkspaceEvent from "./useWorkspaceEvent"

const MINI_RADIUS = 16
const MARGIN_VERTICAL_ = 20
const MARGIN_HORIZONTAL_ = 20
const MIN_SCALE = 0.05
const MAX_WIDTH = 200
const MAX_HEIGHT = 96

function MiniBlock(props: {
    x: number
    y: number
    width: number
    height: number
    color: string
}) {
    const { x, y, width, height, color } = props
    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            rx={MINI_RADIUS}
            ry={MINI_RADIUS}
        />
    )
}

function MiniViewport(props: {
    scroll: MetricsManager.ContainerRegion
    view: MetricsManager.ContainerRegion
}) {
    const { view } = props
    const { top, left, width, height } = view
    const { palette } = useTheme()
    const vx = left
    const vy = top

    return (
        <rect
            x={vx}
            y={vy}
            width={width}
            height={height}
            strokeWidth={MINI_RADIUS >> 1}
            stroke={palette.text.primary}
            fill={palette.grey[400]}
            opacity={0.2}
            rx={MINI_RADIUS}
            ry={MINI_RADIUS}
        />
    )
}

function BlockMiniMap(props: {
    workspace: WorkspaceSvg
    onSizeUpdate: (width: number, height: number) => void
}) {
    const { workspace, onSizeUpdate } = props
    const { palette } = useTheme()
    const svgRef = useRef<SVGSVGElement>()
    const [metrics, setMetrics] = useState<{
        scroll: MetricsManager.ContainerRegion
        contents: MetricsManager.ContainerRegion
        blocks: {
            blockId: string
            rect: utils.Rect
            color: string
        }[]
    }>()
    const [view, setView] = useState<MetricsManager.ContainerRegion>()
    const handleMetrics = () => {
        const metricsManager = workspace.getMetricsManager()
        const view = metricsManager.getViewMetrics(true)
        const contents = metricsManager.getContentMetrics(true)
        const scroll = metricsManager.getScrollMetrics(true, view, contents)
        const tops: BlockSvg[] = arrayConcatMany(
            (workspace.getTopBlocks(false) as BlockSvg[]).map(top => [
                top,
                ...(top.childBlocks_ as BlockSvg[]),
            ])
        )
        const blocks = tops.map(b => ({
            blockId: b.id,
            rect: b.getBoundingRectangle(),
            color: b.getColour(),
        }))
        setMetrics({ scroll, contents, blocks })
        setView(view)
        onSizeUpdate(scroll.width, scroll.height)
    }
    const handleView = () => {
        const metricsManager = workspace.getMetricsManager()
        const view = metricsManager.getViewMetrics(true)
        setView(view)
    }
    const handleChange = useCallback(
        (event: { type: string } & Events.Abstract) => {
            const { type } = event
            switch (type) {
                case Events.BLOCK_CREATE:
                case Events.BLOCK_DELETE:
                case Events.BLOCK_MOVE:
                case Events.BLOCK_CHANGE:
                case Events.FINISHED_LOADING:
                    handleMetrics()
                    break
                case Events.VIEWPORT_CHANGE:
                    handleView()
                    break
            }
        },
        [workspace]
    )
    useWorkspaceEvent(workspace, handleChange)
    useEffect(() => {
        if (workspace) handleMetrics()
    }, [workspace])
    const handleCenterView = (event: React.PointerEvent<Element>) => {
        event.preventDefault()
        event.stopPropagation()
        if (event.buttons < 1) return
        const pos = svgPointerPoint(svgRef.current, event)
        // viewHeight and viewWidth are in pixels.
        const halfViewWidth = view.width / 2
        const halfViewHeight = view.height / 2
        // Put the block in the center of the visible workspace instead.
        const scrollToCenterX = pos.x - halfViewWidth + scroll.left
        const scrollToCenterY = pos.y - halfViewHeight + scroll.top
        // Convert from workspace directions to canvas directions.
        // move to center of view
        const x = -scrollToCenterX
        const y = -scrollToCenterY

        workspace.scroll(x, y)
    }
    // nothing to see
    if (!metrics || !view) return null

    const { scroll, blocks } = metrics
    const cleft = scroll.left
    const ctop = scroll.top
    const cwidth = scroll.width
    const cheight = scroll.height

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${cwidth} ${cheight}`}
            width={cwidth}
            height={cheight}
        >
            <rect
                x={0}
                y={0}
                width={cwidth}
                height={cheight}
                fill={palette.background.paper}
            />
            <g transform={`translate(${-cleft},${-ctop})`}>
                {blocks?.map(({ blockId, rect, color }) => (
                    <MiniBlock
                        key={blockId}
                        x={rect.left}
                        y={rect.top}
                        width={rect.right - rect.left}
                        height={rect.bottom - rect.top}
                        color={color}
                    />
                ))}
                {view && <MiniViewport scroll={scroll} view={view} />}
            </g>
            <rect
                x={0}
                y={0}
                width={cwidth}
                height={cheight}
                fill="transparent"
                stroke={"#aaa"}
                strokeWidth={24}
                onPointerDown={handleCenterView}
                onPointerMove={handleCenterView}
            />
        </svg>
    )
}

class MinimapPlugin implements IPositionable {
    readonly id = "minimap"
    private top_ = 0
    private left_ = 0
    private width_ = MAX_WIDTH
    private height_ = MAX_HEIGHT
    private scale_ = MIN_SCALE
    private svgGroup_: SVGGElement

    constructor(readonly workspace_: WorkspaceSvg) {
        this.init()
    }

    private init() {
        const componentManager = this.workspace_.getComponentManager()
        componentManager.addComponent({
            component: this,
            weight: 2,
            capabilities: [ComponentManager.Capability.POSITIONABLE],
        })
        this.createDom_()
        this.workspace_.resize()
    }

    private createDom_() {
        this.svgGroup_ = utils.dom.createSvgElement(utils.Svg.G, {
            class: "minimap",
        })
        utils.dom.insertAfter(this.svgGroup_, this.workspace_.getBubbleCanvas())
        const root = createRoot(this.svgGroup_)
        root.render(this.render())
    }

    private render() {
        return (
            <BlockMiniMap
                workspace={this.workspace_}
                onSizeUpdate={this.handleSizeUpdate.bind(this)}
            />
        )
    }

    position(metrics: MetricsManager.UiMetrics): void {
        const hasVerticalScrollbars =
            this.workspace_.scrollbar &&
            this.workspace_.scrollbar.canScrollHorizontally()

        if (
            metrics.toolboxMetrics.position === TOOLBOX_AT_LEFT ||
            (this.workspace_.horizontalLayout && !this.workspace_.RTL)
        ) {
            // Right corner placement.
            this.left_ =
                metrics.absoluteMetrics.left +
                metrics.viewMetrics.width -
                this.width_ -
                MARGIN_HORIZONTAL_
            if (hasVerticalScrollbars && !this.workspace_.RTL) {
                this.left_ -= Scrollbar.scrollbarThickness
            }
        } else {
            // Left corner placement.
            this.left_ = MARGIN_HORIZONTAL_
            if (hasVerticalScrollbars && this.workspace_.RTL) {
                this.left_ += Scrollbar.scrollbarThickness
            }
        }

        // Upper corner placement
        this.top_ = metrics.absoluteMetrics.top + MARGIN_VERTICAL_

        this.positionSvgGroup()
    }

    private positionSvgGroup() {
        this.svgGroup_.setAttribute(
            "transform",
            `translate(${this.left_},${this.top_}) scale(${this.scale_})`
        )
    }

    getBoundingRectangle(): utils.Rect {
        return new utils.Rect(
            this.top_,
            this.top_ + this.height_,
            this.left_,
            this.left_ + this.width_
        )
    }

    private handleSizeUpdate(width: number, height: number) {
        if (width !== this.width_ || height !== this.height_) {
            this.scale_ = Math.min(
                MIN_SCALE,
                Math.min(MAX_HEIGHT / height, MAX_WIDTH / width)
            )
            const dw = width * this.scale_ - this.width_
            this.width_ = width * this.scale_
            this.height_ = height * this.scale_
            this.left_ -= dw
            this.positionSvgGroup()
        }
    }
}

export function useBlockMinimap(workspace: WorkspaceSvg) {
    useEffect(() => {
        if (workspace) {
            new MinimapPlugin(workspace)
        }
    }, [workspace])
}
