import React from "react";
import { LOST, FOUND } from "../../../jacdac-ts/src/jdom/constants";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import useEventRaised from "../../jacdac/useEventRaised";
import Alert from "../ui/Alert";

export function DeviceLostAlert(props: { device: JDDevice }) {
    const { device } = props;
    const lost = useEventRaised([LOST, FOUND], device, dev => !!dev?.lost)
    return <>
        {lost && <Alert severity="info">Device lost...</Alert>}
    </>
}