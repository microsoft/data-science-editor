import { AlertTitle } from "@mui/material"
import React from "react"
import Alert from "../ui/Alert"

export function StatusAlert(props: { specification: jdspec.ServiceSpec }) {
    const { specification } = props

    switch (specification?.status) {
        case "deprecated":
            return (
                <Alert severity="error">
                    <AlertTitle>Service deprecated</AlertTitle>
                    This service should not be added to new modules and might
                    not be supported in future releases.
                </Alert>
            )
        case "experimental":
            return (
                <Alert severity="info">
                    <AlertTitle>Experimental service</AlertTitle>
                    This service specification may change in the future.
                </Alert>
            )
        default:
            return null
    }
}

const ServiceSpecificationStatusAlert = React.memo(StatusAlert)

export default ServiceSpecificationStatusAlert
