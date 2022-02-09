import { Grid } from "@mui/material"
import React, { useMemo, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useServiceServer from "../hooks/useServiceServer"
import LightWidget from "../widgets/LightWidget"
import { LedDisplayReg } from "../../../jacdac-ts/src/jdom/constants"
import ColorButtons from "../widgets/ColorButtons"
import useRegister from "../hooks/useRegister"
import SettingsIcon from "@mui/icons-material/Settings"
import RegisterInput from "../RegisterInput"
import { LedDisplayServer } from "../../../jacdac-ts/src/servers/leddisplayserver"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { write24 } from "../../../jacdac-ts/src/jdom/utils"
import LoadingProgress from "../ui/LoadingProgress"

const configureRegisters = [
    LedDisplayReg.Brightness,
    LedDisplayReg.ActualBrightness,
    LedDisplayReg.MaxPower,
]

function RegisterInputItem(props: {
    service: JDService
    registerCode: number
    visible: boolean
}) {
    const { service, registerCode, visible } = props
    const register = useRegister(service, registerCode)
    return (
        <RegisterInput
            register={register}
            visible={visible}
            showRegisterName={true}
        />
    )
}

export default function DashboardLEDDisplay(props: DashboardServiceProps) {
    const { service, services, visible } = props
    const pixelsRegister = useRegister(service, LedDisplayReg.Pixels)
    const [pixels] = useRegisterUnpackedValue<[Uint8Array]>(
        pixelsRegister,
        props
    )
    const [penColor, setPenColor] = useState<number>(undefined)
    const [configure, setConfigure] = useState(false)
    const server = useServiceServer<LedDisplayServer>(service)
    const toggleConfigure = () => setConfigure(c => !c)
    const handleColorChange = (newColor: number) =>
        setPenColor(current => (newColor === current ? undefined : newColor))
    const handleLedClick: (index: number) => void = async (index: number) => {
        if (isNaN(penColor)) return

        const newPixels = pixels.slice(0)
        write24(newPixels, index * 3, penColor)
        await pixelsRegister.sendSetPackedAsync([newPixels], true)
    }
    const registers = useMemo(
        () => ({
            numPixels: LedDisplayReg.NumPixels,
            variant: LedDisplayReg.Variant,
            actualBrightness: LedDisplayReg.ActualBrightness,
            numColumns: LedDisplayReg.NumColumns,
        }),
        []
    )

    if (!pixels) return <LoadingProgress />

    return (
        <>
            <LightWidget
                server={server}
                registers={registers}
                widgetCount={services.length}
                onLedClick={handleLedClick}
                {...props}
            />
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <ColorButtons
                        color={penColor}
                        onColorChange={handleColorChange}
                    />
                </Grid>
                <Grid item>
                    <IconButtonWithTooltip
                        title={
                            configure
                                ? "Hide configuration"
                                : "Show configuration"
                        }
                        onClick={toggleConfigure}
                    >
                        <SettingsIcon />
                    </IconButtonWithTooltip>
                </Grid>

                {configure &&
                    configureRegisters.map(code => (
                        <Grid item key={code}>
                            <RegisterInputItem
                                service={service}
                                registerCode={code}
                                visible={visible}
                            />
                        </Grid>
                    ))}
            </Grid>
        </>
    )
}
