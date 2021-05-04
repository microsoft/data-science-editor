import React from "react"
import { SvgIcon, SvgIconProps } from "@material-ui/core"

export default function EdgeImpulse(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path d="M15.659 10.429a1.617 1.617 0 100 3.236h5.348l-1.23-3.235h-4.118z" />
            <path d="M3.28 13.663h7.85a1.617 1.617 0 100-3.236H3.28a1.617 1.617 0 100 3.236z" />
            <path d="M21.832 16.023H5.105a2.298 2.298 0 100 2.951h17.85z" />
            <path d="M17.81 5.068H5.139A2.3 2.3 0 103.344 8.8c.687 0 1.3-.303 1.721-.78h13.868z" />
        </SvgIcon>
    )
}
