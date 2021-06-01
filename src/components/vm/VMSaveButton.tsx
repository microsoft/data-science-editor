import React from "react"
import SaveIcon from "@material-ui/icons/Save"
import { Tooltip } from "@material-ui/core"
import { IconButton, Link } from "gatsby-theme-material-ui"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { WorkspaceJSON } from "./jsongenerator"

export default function VMSaveButton(props: {
    xml: string
    source: WorkspaceJSON
    program: IT4Program
}) {
    const { xml, source, program } = props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = {
        xml,
    }
    if (Flags.diagnostics) {
        json.source = source
        json.program = program
    }

    const url = `data:application/json;charset=UTF-8,${encodeURIComponent(
        JSON.stringify(json)
    )}`

    return (
        <Link download="jacdac-blocks.json" href={url}>
            <Tooltip title={"save"}>
                <IconButton>
                    <SaveIcon />
                </IconButton>
            </Tooltip>
        </Link>
    )
}
