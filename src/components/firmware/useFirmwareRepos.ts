import { useContext, useState } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useEffectAsync from "../useEffectAsync"
import { unique } from "../../../jacdac-ts/src/jdom/utils"
import {
    BootloaderCmd,
    ControlReg,
    DEVICE_CHANGE,
    SRV_BOOTLOADER,
} from "../../../jacdac-ts/src/jdom/constants"
import useEventRaised from "../../jacdac/useEventRaised"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import useDeviceCatalog from "../devices/useDeviceCatalog"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"

export default function useFirmwareRepos(showAllRepos?: boolean) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [repos, setRepos] = useState<string[]>([])
    const specifications = useDeviceSpecifications()
    const deviceCatalog = useDeviceCatalog()
    const devices = useEventRaised(DEVICE_CHANGE, bus, () =>
        bus.devices({ announced: true, ignoreInfrastructure: true })
    )
    const bootloaders = devices.filter(device =>
        device.hasService(SRV_BOOTLOADER)
    )
    const registers = devices
        .filter(device => !device.hasService(SRV_BOOTLOADER)) // not a bootloader
        .map(device =>
            device.service(0)?.register(ControlReg.ProductIdentifier)
        )
        .filter(reg => !!reg)

    useEffectAsync(
        async mounted => {
            let repos: string[] = []
            if (showAllRepos) repos = specifications.map(spec => spec.repo)
            else {
                const productIdentifiers: number[] = []
                // ask firmware registers
                for (const register of registers) {
                    await register.refresh(true)
                    const productIdentifier = register.intValue
                    if (
                        productIdentifier !== undefined &&
                        productIdentifiers.indexOf(productIdentifier) < 0
                    )
                        productIdentifiers.push(productIdentifier)
                }

                // ask bootloaders
                for (const bootloader of bootloaders) {
                    const boot = bootloader.services({
                        serviceClass: SRV_BOOTLOADER,
                    })[0]
                    const bl_announce = Packet.onlyHeader(BootloaderCmd.Info)
                    try {
                        const resp = await boot.sendCmdAwaitResponseAsync(
                            bl_announce
                        )
                        const [, , , productIdentifier] =
                            resp.jdunpack<[number, number, number, number]>(
                                "u32 u32 u32 u32"
                            )
                        if (
                            productIdentifier !== undefined &&
                            productIdentifiers.indexOf(productIdentifier) < 0
                        )
                            productIdentifiers.push(productIdentifier)
                    } catch (e) {
                        console.warn(`bootloader product identifier failed`, e)
                    }
                }
                repos = productIdentifiers
                    .map(
                        fw =>
                            deviceCatalog.specificationFromProductIdentifier(fw)
                                ?.repo
                    )
                    .filter(repo => !!repo)
            }
            if (mounted) {
                const urepos = unique(repos)
                setRepos(urepos)
            }
        },
        [
            dependencyId(devices),
            dependencyId(registers),
            showAllRepos,
            specifications,
        ]
    )
    return repos
}
