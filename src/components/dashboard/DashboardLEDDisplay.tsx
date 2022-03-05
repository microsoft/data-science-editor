import { Grid } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import LightWidget from "../widgets/LightWidget"
import {
    LedDisplayReg,
    RENDER,
    REPORT_UPDATE,
} from "../../../jacdac-ts/src/jdom/constants"
import ColorButtons from "../widgets/ColorButtons"
import useRegister from "../hooks/useRegister"
import SettingsIcon from "@mui/icons-material/Settings"
import RegisterInput from "../RegisterInput"
import { bufferEq } from "../../../jacdac-ts/src/jdom/utils"
import LoadingProgress from "../ui/LoadingProgress"
import useChange from "../../jacdac/useChange"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"

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
    const hasData = useChange(pixelsRegister, _ => !!_?.data)
    const [penColor, setPenColor] = useState<number>(undefined)
    const [configure, setConfigure] = useState(false)
    const colorsRef = useRef<Uint8Array>(new Uint8Array(0))
    const clientRef = useRef(new JDEventSource())
    const toggleConfigure = () => setConfigure(c => !c)
    const handleColorChange = (newColor: number) =>
        setPenColor(current => (newColor === current ? undefined : newColor))
    const handleLedClick: (index: number) => void = async (index: number) => {
        if (isNaN(penColor)) return

        const pixels = colorsRef.current
        if (index >= pixels.length * 3) return

        const newPixels = pixels.slice(0)
        const k = index * 3
        newPixels[k] = (penColor >> 16) & 0xff
        newPixels[k + 1] = (penColor >> 8) & 0xff
        newPixels[k + 2] = penColor & 0xff
        await pixelsRegister.sendSetPackedAsync([newPixels], true)
        colorsRef.current = newPixels
        clientRef.current.emit(RENDER)
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

    useEffect(
        () =>
            pixelsRegister?.subscribe(REPORT_UPDATE, () => {
                const [pixels] = pixelsRegister.unpackedValue
                if (pixels && !bufferEq(colorsRef.current, pixels)) {
                    colorsRef.current = pixels.slice(0)
                    clientRef.current.emit(RENDER)
                }
            }),
        [pixelsRegister]
    )
    const colors: () => Uint8Array = useCallback(() => colorsRef.current, [])
    const subscribeColors = useCallback(
        handler => clientRef.current.subscribe(RENDER, handler),
        []
    )

    if (!hasData) return <LoadingProgress />
    return (
        <>
            <LightWidget
                colors={colors}
                subscribeColors={subscribeColors}
                registers={registers}
                widgetCount={services?.length}
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
