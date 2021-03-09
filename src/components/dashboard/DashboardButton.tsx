import React, { useEffect, useState } from "react";
import { ButtonEvent, ButtonReg, EVENT, REPORT_UPDATE } from "../../../jacdac-ts/src/jdom/constants";
import ButtonServiceHost from "../../../jacdac-ts/src/hosts/buttonservicehost";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import ButtonWidget from "../widgets/ButtonWidget";
import useServiceHost from "../hooks/useServiceHost";
import LoadingProgress from "../ui/LoadingProgress"

export default function DashboardButton(props: DashboardServiceProps) {
    const { service } = props;
    const [pressed, setPressed] = useState<boolean>(false)
    const pressedRegister = service.register(ButtonReg.Pressed);
    // track register
    useEffect(() => pressedRegister?.subscribe(REPORT_UPDATE, () => {
        const [b] = pressedRegister?.unpackedValue || [];
        if (b !== undefined)
            setPressed(b)
    }), [pressedRegister])
    // track event up/down events
    const downEvent = service.event(ButtonEvent.Down);
    useEffect(() => downEvent.subscribe(EVENT, () => setPressed(true)), [downEvent])
    const upEvent = service.event(ButtonEvent.Up);
    useEffect(() => upEvent.subscribe(EVENT, () => setPressed(false)), [upEvent])

    const host = useServiceHost<ButtonServiceHost>(service);
    const color = host ? "secondary" : "primary";
    const label = `button ${pressed ? `down` : `up`}`
    const handleDown = () => host?.down();
    const handleUp = () => host?.up();
    const widgetSize = `clamp(5em, 25vw, 100%)`

    if (pressed === undefined)
        return <LoadingProgress />;
    
    return <ButtonWidget
        checked={!!pressed}
        color={color}
        onDown={host && handleDown}
        onUp={host && handleUp}
        label={label}
        size={widgetSize}
    />
}