import { ButtonProps } from "@material-ui/core"
import { Button } from "gatsby-theme-material-ui"
import React from "react"
import { JDService } from "../../jacdac-ts/src/jdom/service"

export default function ServiceButton(
    props: { service: JDService; onClick?: () => void } & ButtonProps
) {
    const { service, onClick, ...others } = props
    return (
        <Button
            {...others}
            variant="contained"
            color="primary"
            onClick={onClick}
        >
            {service.name}
        </Button>
    )
}
