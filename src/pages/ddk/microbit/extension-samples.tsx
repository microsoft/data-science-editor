import React from "react"
import GithubRepositoryList from "../../../components/github/GithubRespositoryList"

export default function Samples() {
    const repos = [
        "pelikhan/pxt-makerbit-motor/jacdac",
        "pelikhan/pxt-makerbit-touch/jacdac",
        "pelikhan/pxt-makerbit-lcd1602/jacdac",

        "pelikhan/pxt-kitronik-air-quality/jacdac",
        "pelikhan/pxt-kitronik-stopbit/jacdac",
        "pelikhan/pxt-kitronik-viewtext32/jacdac",
        "pelikhan/pxt-kitronik-lampbit/jacdac",
        "pelikhan/pxt-kitronik-simple-servo/jacdac",
        "pelikhan/pxt-kitronik-motor-driver/jacdac",
        "pelikhan/pxt-kitronik-zip-64/jacdac",
        "pelikhan/pxt-kitronik-accessbit/jacdac",
        "pelikhan/pxt-kitronik-servo-lite/jacdac",

        "pelikhan/monkmakes-7-segment/jacdac",

        "pelikhan/pxt-envirobit/jacdac",
        "pelikhan/pxt-weather-bit/jacdac",

        "pelikhan/pxt-robotbit/jacdac",

        "pelikhan/Tiny-bitLib/jacdac",
        "pelikhan/yahboom-microbit-led-jacdac/",

        "pelikhan/pxt-k-bit/jacdac",
    ]
    return (
        <>
            <h1>MakeCode/Jacdac accessory extension samples</h1>
            <p>
                This page links to a number of accessory extension repositories
                with the software-only Jacdac layer implemented.
            </p>
            <p>
                These samples can be tested from MakeCode by importing the
                repository path into the <code>Add Extension</code> dialog.
            </p>
            <GithubRepositoryList
                repos={repos}
                showDescription={true}
                showDependencies={true}
                showMakeCodeButton={true}
            />
        </>
    )
}
