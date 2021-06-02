import React, { useMemo } from "react"
import {
    REGISTER_OPTIONAL_POLL_COUNT,
    SystemReg,
} from "../../../jacdac-ts/src/jdom/constants"
import useChange from "../../jacdac/useChange"
import RegisterInput from "../RegisterInput"
import { isRegister } from "../../../jacdac-ts/src/jdom/spec"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { Grid } from "@material-ui/core"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"

// filter out common registers
const ignoreRegisters = [
    SystemReg.StatusCode,
    SystemReg.StreamingPreferredInterval,
    SystemReg.StreamingSamples,
    SystemReg.StreamingInterval,
]
const collapsedRegisters = [
    SystemReg.Reading,
    SystemReg.Value,
    SystemReg.Intensity,
]

export default function DashboardServiceDetails(props: DashboardServiceProps) {
    const { service, expanded, visible } = props
    const specification = useMemo(() => service?.specification, [service])
    const registers: JDRegister[] = useMemo(() => {
        const packets = specification?.packets
        let ids =
            packets
                ?.filter(pkt => isRegister(pkt))
                ?.map(pkt => pkt.identifier) || []
        ids = ids.filter(id => ignoreRegisters.indexOf(id) < 0)
        if (!expanded)
            // grab the first interresting register
            ids = ids
                .filter(id => collapsedRegisters.indexOf(id) > -1)
                .slice(0, 1)
        return (
            ids
                .map(id => service.register(id))
                .filter(reg => !!reg)
                // hide optional const register without values
                .filter(
                    reg =>
                        !reg.specification?.optional ||
                        (reg.specification?.kind === "const" &&
                            reg.lastGetAttempts < REGISTER_OPTIONAL_POLL_COUNT)
                )
        )
    }, [specification, expanded])

    if (!registers?.length)
        // nothing to see here
        return null

    return (
        <>
            {registers.map(register => {
                return (
                    <Grid key={register.id} item xs={true}>
                        <RegisterInput
                            register={register}
                            showServiceName={true}
                            showRegisterName={true}
                            hideMissingValues={false}
                            showTrend={false}
                            visible={visible}
                        />
                    </Grid>
                )
            })}
        </>
    )
}
