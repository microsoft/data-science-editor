import React, { CSSProperties, lazy, useContext } from "react"
import Suspense from "../../ui/Suspense"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import WorkspaceContext from "../WorkspaceContext"
const ReactPlayer = lazy(() => import("react-player"))

export interface VidelPlayerOptions extends ReactFieldJSON {
    url?: string
}

const style: CSSProperties = {
    aspectRatio: "16 /9",
}

function VideoPlayerWidget(props: { url: string }) {
    const { url } = props
    const { flyout } = useContext(WorkspaceContext)

    if (flyout || !url) return null

    const vurl = /^https:\/\//.test(url)
        ? url
        : `https://www.youtube.com/watch?v=${url}`

    return (
        <Suspense>
            <ReactPlayer
                playIcon={<PlayCircleIcon />}
                pip={false}
                playsinline={true}
                style={style}
                controls={true}
                url={vurl}
                width="100%"
                height="100%"
            />
        </Suspense>
    )
}

export default class VideoPlayerField extends ReactInlineField {
    static KEY = "video_player"
    EDITABLE = false
    url: string

    static fromJson(options: VidelPlayerOptions) {
        return new VideoPlayerField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
        this.url = options?.url
        this.minWidth = "22rem"
    }

    renderInlineField() {
        return <VideoPlayerWidget url={this.url} />
    }
}
