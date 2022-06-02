import React from "react"
import { splitFilter } from "../../../../jacdac-ts/src/jdom/utils"
import GithubRepositoryList from "../../../components/github/GithubRespositoryList"

export default function Samples() {
    const repos = [
        // merged extensions
        "1010Technologies/pxt-makerbit-motor/jacdac",
        "1010Technologies/pxt-makerbit-touch/jacdac",
        "1010Technologies/pxt-makerbit-lcd1602/jacdac",
        "monkmakes/monkmakes-7-segment/jacdac",
        "mworkfun/pxt-k-bit/jacdac",

        // PR in progress
        "pelikhan/pxt-kitronik-stopbit/jacdac",
        "pelikhan/pxt-kitronik-viewtext32/jacdac",
        "pelikhan/pxt-kitronik-lampbit/jacdac",
        "pelikhan/pxt-kitronik-simple-servo/jacdac",
        "pelikhan/pxt-kitronik-motor-driver/jacdac",
        "pelikhan/pxt-kitronik-zip-64/jacdac",
        "pelikhan/pxt-kitronik-accessbit/jacdac",
        "pelikhan/pxt-kitronik-servo-lite/jacdac",
        "pelikhan/pxt-kitronik-i2c-16-servo/jacdac",
        "pelikhan/pxt-gamer-bit/jacdac",
        "pelikhan/pxt-envirobit/jacdac",
        "pelikhan/pxt-weather-bit/jacdac",
        "pelikhan/pxt-robotbit/jacdac",
        "pelikhan/Tiny-bitLib/jacdac",

        // needs PR
        "pelikhan/pxt-kitronik-air-quality/jacdac",
        "pelikhan/kitronik-zip-halo-jacdac",
        "pelikhan/yahboom-microbit-led-jacdac/",
        "pelikhan/keystudio-relay-breakout-jacdac/",
        "pelikhan/pxt-dfrobot_maqueenplus_v20/jacdac",
    ]

    const [official, samples] = splitFilter(repos, r => !/^pelikhan\//.test(r))

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
            <h2>Extensions</h2>
            <GithubRepositoryList
                repos={official}
                showDescription={true}
                showDependencies={true}
                showMakeCodeButton={true}
                showMakeCodeImportButton={true}
            />
            <h2>Samples</h2>
            <GithubRepositoryList
                repos={samples}
                showDescription={true}
                showDependencies={true}
                showMakeCodeButton={true}
                showMakeCodeImportButton={true}
            />
        </>
    )
}
