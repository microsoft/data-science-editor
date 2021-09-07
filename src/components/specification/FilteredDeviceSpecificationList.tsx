import { Box } from "@material-ui/core";
import React, { useState } from "react";
import DeviceSpecificationList from "./DeviceSpecificationList";
import ServiceSpecificationSelect from "./ServiceSpecificationSelect";


export default function FilteredDeviceSpecificationList(props: {
    count?: number,
    shuffle?: boolean,
}) {
    const { ...others } = props;

    const [serviceClass, setServiceClass] = useState<number>(NaN)
    const handleServiceChanged = (value) => setServiceClass(value)
    const requiredServiceClasses = !isNaN(serviceClass) && [serviceClass]

    return <>
        <Box mb={1}>
            <ServiceSpecificationSelect
                label="Filter by Service"
                serviceClass={serviceClass}
                setServiceClass={handleServiceChanged} />
        </Box>
        <DeviceSpecificationList
            {...others}
            requiredServiceClasses={requiredServiceClasses} />
    </>
}