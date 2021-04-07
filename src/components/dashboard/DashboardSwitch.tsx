import { SwitchReg, SwitchVariant } from "../../../jacdac-ts/src/jdom/constants";
import { useRegisterBoolValue, useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useServiceServer from "../hooks/useServiceServer";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import SwitchServer from "../../../jacdac-ts/src/servers/switchserver"
import React from "react";
import { Switch } from "@material-ui/core";
import { useId } from "react-use-id-hook"
import ButtonWidget from "../widgets/ButtonWidget";
import LoadingProgress from "../ui/LoadingProgress";

export default function DashboardSwitch(props: DashboardServiceProps) {
    const { service } = props;

    const labelId = useId();
    const on = useRegisterBoolValue(service.register(SwitchReg.Active), props)
    const [switchVariant] = useRegisterUnpackedValue<[SwitchVariant]>(service.register(SwitchReg.Variant), props);
    const host = useServiceServer<SwitchServer>(service);
    const color = host ? "secondary" : "primary";
    const widgetSize = `clamp(5em, 25vw, 100%)`

    const handleToggle = () => host?.toggle();

    if (on === undefined)
        return <LoadingProgress />;

    switch (switchVariant) {
        case SwitchVariant.PushButton:
            return <ButtonWidget
                checked={on}
                color={color}
                label={on ? "on" : "off"}
                onDown={host && handleToggle}
                size={widgetSize} />
        default:
            return <>
                <Switch aria-labelledby={labelId} color={color} checked={on} onChange={host && handleToggle} />
                <label id={labelId}>{on ? "on" : "off"}</label>
            </>
    }
}