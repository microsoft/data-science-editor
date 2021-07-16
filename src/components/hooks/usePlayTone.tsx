import { useEffect, useState, useContext, useCallback } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { startServiceProviderFromServiceClass } from "../../../jacdac-ts/src/servers/servers"
import { BuzzerCmd, SRV_BUZZER } from "../../../jacdac-ts/src/jdom/constants"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import useServices from "./useServices"
import BuzzerServer, {
    BuzzerTone,
    tonePayload,
} from "../../../jacdac-ts/src/servers/buzzerserver"
import WebAudioContext from "../ui/WebAudioContext"

export function usePlayTone() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const buzzers = useServices({ serviceClass: SRV_BUZZER })
    const [buzzerServer, setBuzzerServer] = useState<BuzzerServer>()

    const { playTone, onClickActivateAudioContext, activated } =
        useContext(WebAudioContext)

    // useEffect invokes a function call whenever the variables
    // (passed as an array) change.
    // if clean up is required, return a clean up callback
    //
    // listen for playTone commands from the buzzer via subscribe
    // subscribe returns a clean up function that is invoked when the user
    // browses away from the page.
    // playtone uses the audio context set in handleBrowserAudioEnable
    useEffect(
        () =>
            buzzerServer?.subscribe<BuzzerTone>(
                BuzzerServer.PLAY_TONE,
                ({ frequency, duration, volume }) =>
                    playTone(frequency, duration, volume)
            ),
        [buzzerServer]
    )
    // clean out buzzer server on page close.
    // defines an empty function that returns a function.
    // invoked each time buzzerServer changes
    useEffect(
        () => () =>
            buzzerServer?.device &&
            bus.removeServiceProvider(buzzerServer.device),
        [buzzerServer]
    )

    // when start browser audio button is clicked:
    // get a browser audio context
    // spin up a virtual buzzer that we latermap to the browser audio engine
    const toggleBrowserAudio = () => {
        // browser security dictates that the audio context be used within a click event
        // must be done once to allow background sounds
        onClickActivateAudioContext()
        if (!buzzerServer) {
            const dev = startServiceProviderFromServiceClass(bus, SRV_BUZZER)
            const srv = dev
                .services()
                .find(s => s.serviceClass === SRV_BUZZER) as BuzzerServer
            setBuzzerServer(srv)
        } else {
            setBuzzerServer(undefined)
        }
    }

    const buzzerPlayTone = useCallback(
        async (frequency: number, duration: number, volume: number) => {
            await Promise.all(
                // for each buzzer, map x acceleration to buzzer output
                buzzers?.map(async buzzer => {
                    const pkt = Packet.from(
                        BuzzerCmd.PlayTone,
                        tonePayload(frequency, duration, volume)
                    )
                    await buzzer.sendPacketAsync(pkt)
                })
            )
        },
        [buzzers]
    )

    const browserAudio = activated && !!buzzerServer
    return {
        playTone: buzzerPlayTone,
        toggleBrowserAudio,
        browserAudio,
    }
}
