import React, { lazy, useContext, useMemo, useRef, useState } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import useBlockData from "../../useBlockData"
import { PointerBoundary } from "../PointerBoundary"
import Suspense from "../../../ui/Suspense"
import { Grid, makeStyles, NoSsr } from "@material-ui/core"
import { CHART_HEIGHT, CHART_SVG_MAX_ITEMS, CHART_WIDTH } from "../../toolbox"
import type { View, VisualizationSpec } from "react-vega"
import type { DataSliceOptions } from "../../../../workers/data/dist/node_modules/data.worker"
import useEffectAsync from "../../../useEffectAsync"
import { tidyResolveHeader, tidySlice } from "./../tidy"
import { JSONTryParse } from "../../../../../jacdac-ts/src/jdom/utils"
import { humanify } from "../../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import CopyButton from "../../../ui/CopyButton"
import FullscreenIcon from "@material-ui/icons/Fullscreen"
import IconButtonWithTooltip from "../../../ui/IconButtonWithTooltip"
const VegaLite = lazy(() => import("./VegaLite"))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clone(v: any) {
    return v ? JSON.parse(JSON.stringify(v)) : v
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isKV(v: any) {
    return !!v && typeof v === "object" && !Array.isArray(v)
}
// eslint-disable-next-line @typescript-eslint/ban-types
function jsonMergeFrom(trg: object, src: object) {
    if (!src) return
    Object.keys(src).forEach(k => {
        if (isKV(trg[k]) && isKV(src[k])) jsonMergeFrom(trg[k], src[k])
        else trg[k] = clone(src[k])
    })
}

const useStyles = makeStyles(() => ({
    button: {
        color: "grey",
    },
}))

export default function VegaLiteWidget(props: {
    spec: VisualizationSpec
    slice?: DataSliceOptions
}) {
    const { spec, slice } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const classes = useStyles()
    // eslint-disable-next-line @typescript-eslint/ban-types
    const [vegaData, setVegaData] = useState<{ values: object[] }>(undefined)
    const viewRef = useRef<View>()

    const group = tidyResolveHeader(data, sourceBlock?.getFieldValue("group"))
    const settings = JSONTryParse(sourceBlock?.getFieldValue("settings"))
    const handleNewView = (view: View) => (viewRef.current = view)

    // TODO merge json
    const fullSpec = useMemo(() => {
        if (!settings) return spec
        const s = clone(spec)
        if (s.encoding)
            Object.values(s.encoding)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((e: any) => !e.title)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .forEach((e: any) => (e.title = humanify(e.field)))
        jsonMergeFrom(s, settings)
        if (
            Object.values(s.encoding || {}).some(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (encoding: any) =>
                    encoding?.scale?.domainMin !== undefined ||
                    encoding?.scale?.domainMax !== undefined
            )
        ) {
            s.mark.clip = true
        }
        if (group) {
            s.encoding.color = {
                field: group,
                title: humanify(group),
                type: "nominal",
            }
            s.encoding.strokeDash = {
                field: group,
                title: humanify(group),
                type: "nominal",
            }
        }
        return s
    }, [spec, group, settings])

    useEffectAsync(
        async mounted => {
            if (!slice) {
                setVegaData({ values: data })
            } else {
                const sliced = await tidySlice(data, slice)
                if (mounted()) setVegaData({ values: sliced })
            }
        },
        [data]
    )

    if (!vegaData?.values?.length || !spec) return null

    const renderer =
        vegaData.values.length < CHART_SVG_MAX_ITEMS ? "svg" : "canvas"
    const handleCopy = async () => {
        const view = viewRef.current
        const canvas = await view?.toCanvas(2)
        return canvas
    }
    const handleFullScreen = async () => {
        const view = viewRef.current
        const container = view?.container()
        if (!container) return
        const svg = container.firstElementChild as HTMLElement
        if (svg.getAttribute("width")) {
            container.style.width = svg.getAttribute("width") + "px"
            container.style.height = svg.getAttribute("height") + "px"
            svg.style.width = "100%"
            svg.style.height = "100%"
            svg.removeAttribute("width")
            svg.removeAttribute("height")
        }
        await container?.requestFullscreen({
            navigationUI: "hide",
        })
    }

    return (
        <NoSsr>
            <PointerBoundary>
                <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                    <Grid container direction="column" spacing={1}>
                        <Grid item xs={12}>
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                                alignItems="center"
                                spacing={1}
                            >
                                <Grid item>
                                    <CopyButton
                                        size="small"
                                        className={classes.button}
                                        onCopy={handleCopy}
                                    />
                                </Grid>
                                <Grid item>
                                    <IconButtonWithTooltip
                                        title="show full screen"
                                        className={classes.button}
                                        onClick={handleFullScreen}
                                    >
                                        <FullscreenIcon />
                                    </IconButtonWithTooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Suspense>
                                <VegaLite
                                    actions={false}
                                    width={CHART_WIDTH}
                                    height={CHART_HEIGHT}
                                    spec={fullSpec}
                                    data={vegaData}
                                    renderer={renderer}
                                    tooltip={true}
                                    onNewView={handleNewView}
                                />
                            </Suspense>
                        </Grid>
                    </Grid>
                </div>
            </PointerBoundary>
        </NoSsr>
    )
}

/**
 * https://github.com/vega/vega-embed/issues/733
actions {
                                export: { png: true, svg: true },
                                source: false,
                                compiled: false,
                                editor: false,
                            }
 */
