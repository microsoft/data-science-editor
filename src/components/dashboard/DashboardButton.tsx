import React, { useEffect, useState } from "react";
import { ButtonEvent, ButtonReg, EVENT, REPORT_UPDATE } from "../../../jacdac-ts/src/jdom/constants";
import ButtonServer from "../../../jacdac-ts/src/servers/buttonserver";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import ButtonWidget from "../widgets/ButtonWidget";
import useServiceServer from "../hooks/useServiceServer";
import LoadingProgress from "../ui/LoadingProgress"

export default function DashboardButton(props: DashboardServiceProps) {
    const { service, visible } = props;
    const [pressed, setPressed] = useState<boolean>(false)
    const pressedRegister = service.register(ButtonReg.Pressed);
    // track register
    useEffect(() => visible && pressedRegister?.subscribe(REPORT_UPDATE, () => {
        const [b] = pressedRegister?.unpackedValue || [];
        if (b !== undefined)
            setPressed(b)
    }), [pressedRegister, visible])
    // track event up/down events
    const downEvent = service.event(ButtonEvent.Down);
    useEffect(() => downEvent.subscribe(EVENT, () => setPressed(true)), [downEvent])
    const upEvent = service.event(ButtonEvent.Up);
    useEffect(() => upEvent.subscribe(EVENT, () => setPressed(false)), [upEvent])

    const server = useServiceServer<ButtonServer>(service);
    const color = server ? "secondary" : "primary";
    const label = `button ${pressed ? `down` : `up`}`
    const handleDown = () => server?.down();
    const handleUp = () => server?.up();
    const widgetSize = `clamp(3rem, 10vw, 16vw)`

    if (pressed === undefined)
        return <LoadingProgress />;
    
    return <ButtonWidget
        checked={!!pressed}
        color={color}
        onDown={server && handleDown}
        onUp={server && handleUp}
        label={label}
        size={widgetSize}
    />
}