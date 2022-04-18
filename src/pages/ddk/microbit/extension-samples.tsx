import React from "react"
import GithubRepositoryList from "../../../components/github/GithubRespositoryList"

export default function Samples() {
    const repos = [
        "pelikhan/pxt-makerbit-motor",
        "pelikhan/pxt-makerbit-touch",
        "pelikhan/pxt-kitronik-air-quality",
        "pelikhan/pxt-kitronik-stopbit",
        "pelikhan/pxt-kitronik-viewtext32",
        "pelikhan/pxt-kitronik-lampbit",
        "pelikhan/pxt-kitronik-simple-servo",
        "pelikhan/pxt-kitronik-motor-driver",
        "pelikhan/monkmakes-7-segment",
        "pelikhan/pxt-envirobit",
        "pelikhan/pxt-weather-bit",
        "pelikhan/pxt-robotbit",
    ].map(r => `${r}/jacdac`)
    return (
        <>
            <h1>MakeCode/Jacdac accessory extension samples</h1>
            <p>
                This page links to a number of accessory extension repositories
                with the software-only Jacdac layer implemented.
            </p>
            <p>
                These samples can be tested from MakeCode by importing the
                repository path into the Add Extension dialog.
            </p>
            <GithubRepositoryList
                repos={repos}
                showDescription={true}
                showDependencies={true}
            />
        </>
    )
}
