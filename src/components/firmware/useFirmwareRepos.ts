import { useContext, useState } from "react";
import { deviceSpecificationFromFirmwareIdentifier, deviceSpecifications } from "../../../jacdac-ts/src/jdom/spec";
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import useEffectAsync from "../useEffectAsync";
import { unique } from "../../../jacdac-ts/src/jdom/utils";
import { BootloaderCmd, ControlReg, DEVICE_CHANGE, SRV_BOOTLOADER } from "../../../jacdac-ts/src/jdom/constants";
import useEventRaised from "../../jacdac/useEventRaised";
import Packet from "../../../jacdac-ts/src/jdom/packet";

export default function useFirmwareRepos(showAllRepos?: boolean) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [repos, setRepos] = useState<string[]>([])

    const devices = useEventRaised(DEVICE_CHANGE, bus, () => bus.devices().filter(dev => dev.announced))
    const bootloaders = devices.filter(device => device?.hasService(SRV_BOOTLOADER));
    const registers = devices
        .filter(device => !device?.hasService(SRV_BOOTLOADER)) // not a bootloader
        .map(device => device?.service(0)?.register(ControlReg.FirmwareIdentifier))
        .filter(reg => !!reg);

    useEffectAsync(async (mounted) => {
        let repos: string[] = [];
        if (showAllRepos)
            repos = deviceSpecifications().map(spec => spec.repo);
        else {
            const firmwares: number[] = [];
            // ask firmware registers
            for (const register of registers) {
                await register.refresh(true)
                const firmwareIdentifier = register.intValue;
                if (firmwareIdentifier !== undefined && firmwares.indexOf(firmwareIdentifier) < 0)
                    firmwares.push(firmwareIdentifier);
            }
            // ask bootloaders
            for (const bootloader of bootloaders) {
                const boot = bootloader.services({ serviceClass: SRV_BOOTLOADER })[0];
                const bl_announce = Packet.onlyHeader(BootloaderCmd.Info)
                try {
                    const resp = await boot.sendCmdAwaitResponseAsync(bl_announce);
                    const [, , , firmwareIdentifier] = resp.jdunpack<[number, number, number, number]>("u32 u32 u32 u32");
                    if (firmwareIdentifier !== undefined && firmwares.indexOf(firmwareIdentifier) < 0)
                        firmwares.push(firmwareIdentifier);
                }
                catch (e) {
                    console.warn(`bootloader firmware identifier failed`, e)
                }
            }
            repos = firmwares.map(fw => deviceSpecificationFromFirmwareIdentifier(fw)?.repo)
                .filter(repo => !!repo);
        }
        if (mounted)
            setRepos(unique(repos))
    }, [devices.map(dev => dev.id).join(), registers.map(reg => reg.id).join(), showAllRepos])
    return repos;
}