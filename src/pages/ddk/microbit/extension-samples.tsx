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
        "pelikhan/monkmakes-7-segment",
        "pelikhan/pxt-envirobit",
        "pelikhan/pxt-weather-bit",
    ].map(r => `${r}/jacdac`)
    return (
        <>
            <h1>Jacdac extension samples</h1>
            <GithubRepositoryList
                repos={repos}
                showDescription={true}
                showRelease={true}
            />
        </>
    )
}
