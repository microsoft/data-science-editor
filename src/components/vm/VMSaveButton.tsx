import React from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import SaveIcon from "@material-ui/icons/Save"
import { toUTF8 } from "../../../jacdac-ts/src/jdom/utils"
import { Tooltip } from "@material-ui/core"
import { IconButton, Link } from "gatsby-theme-material-ui"

export default function VMSaveButton(props: { xml: string }) {
    const { xml } = props
    const json = {
        xml: xml,
    }
    const url = `data:application/json;charset=UTF-8,${encodeURIComponent(
        JSON.stringify(json)
    )}`

    return (
        <Link download="jacdac-blocks.jdblocks" href={url}>
            <Tooltip title={"save"}>
                <IconButton>
                    <SaveIcon />
                </IconButton>
            </Tooltip>
        </Link>
    )
}
