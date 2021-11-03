import React from "react"
import Markdown from "./ui/Markdown"
import ServiceSpecificationStatusAlert from "./specification/ServiceSpecificationStatusAlert"
import { Button, Link } from "gatsby-theme-material-ui"
import DeviceSpecificationList from "./specification/DeviceSpecificationList"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"
import { Grid } from "@mui/material"
import ServiceSpecificationSource from "./specification/ServiceSpecificationSource"
import MakeCodeIcon from "./icons/MakeCodeIcon"

function ServiceButtons(props: {
    service: jdspec.ServiceSpec
    makecodeSlug?: string
}) {
    const { service, makecodeSlug } = props
    const { shortId } = service

    return (
        <Grid container spacing={1}>
            <Grid item>
                <Button
                    variant="contained"
                    to={`/services/${shortId}/playground/`}
                >
                    Playground
                </Button>
            </Grid>
            {makecodeSlug && (
                <Grid item>
                    <Button
                        variant="contained"
                        to={makecodeSlug}
                        startIcon={<MakeCodeIcon />}
                    >
                        MakeCode
                    </Button>
                </Grid>
            )}
        </Grid>
    )
}

export default function ServiceMarkdown(props: {
    classIdentifier: number
    source: string
    makecodeSlug?: string
}) {
    const { classIdentifier, source, makecodeSlug } = props
    const service = serviceSpecificationFromClassIdentifier(classIdentifier)
    const { shortId } = service

    return (
        <>
            <ServiceSpecificationStatusAlert specification={service} />
            <Markdown source={source} />
            {service && (
                <ServiceButtons service={service} makecodeSlug={makecodeSlug} />
            )}

            <h2>Registered Devices</h2>
            <DeviceSpecificationList
                requiredServiceClasses={[classIdentifier]}
            />

            <h2>Sources</h2>
            <ServiceSpecificationSource serviceSpecification={service} />

            <h2> See Also</h2>
            <ul>
                <li>
                    <a
                        href={`https://github.com/microsoft/jacdac/blob/main/services/${shortId}.md`}
                    >
                        View source
                    </a>
                </li>
                <li>
                    Read{" "}
                    <Link to="/reference/service-specification/">
                        Service Specification Language
                    </Link>{" "}
                    reference
                </li>
            </ul>
        </>
    )
}
