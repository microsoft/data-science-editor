import React from "react"
import Alert from "../ui/Alert"

export function StatusAlert(props: { specification: jdspec.ServiceSpec }) {
    const { specification } = props

    switch (specification?.status) {
        case "deprecated":
            return <Alert severity="error">Deprecated</Alert>
        case "experimental":
            return <Alert severity="info">Experimental</Alert>
        default:
            return null
    }
}

const ServiceSpecificationStatusAlert = React.memo(StatusAlert)

export default ServiceSpecificationStatusAlert
