/* eslint-disable @typescript-eslint/no-extra-semi */
import { unique } from "../../../jacdac-ts/src/jdom/utils"
import { makeCodeServices } from "./services"

export interface MakeCodeSnippetSource {
    code: string
    meta: {
        editor?: string
        snippet?: boolean
        dependencies: string[]
    }
}

export interface MakeCodeSnippetRendered {
    uri?: string
    width?: number
    height?: number
    error?: string
}

export default function parseMakeCodeSnippet(
    source: string
): MakeCodeSnippetSource {
    let code = ""
    const meta: {
        editor?: string
        snippet?: boolean
        dependencies: string[]
    } = {
        dependencies: [],
    }

    if (/^-----\n/.test(source)) {
        let front: string
        const parts = source.replace(/^-----\n/, "").split(/-----\n/gm)
        switch (parts.length) {
            case 1:
                front = undefined
                code = source
                break
            default:
                ;[front, code] = parts
                break
        }

        // parse front matter
        front?.replace(/([a-z0-9]+):\s*(.+)\s*\n/gi, (m, name, value) => {
            switch (name) {
                case "dep":
                    meta.dependencies.push(value)
                    break
                case "snippet":
                    meta.snippet = !!value
                    break
                case "editor":
                    meta.editor = value
                    break
                default:
                    meta[name] = value
            }
            return ""
        })
    } else {
        code = source
    }

    // sniff services
    const mkcds = makeCodeServices()
    mkcds
        .filter(info => {
            return (
                code.indexOf(info.client.qName) > -1 ||
                (info.client.default && code.indexOf(info.client.default) > -1)
            )
        })
        .map(
            info =>
                `${info.client.name.replace(/^pxt-/, "")}=github:${
                    info.client.repo
                }`
        )
        .forEach(dep => meta.dependencies.push(dep))

    // add jacdac by default
    if (!meta.dependencies.length)
        meta.dependencies.push("jacdac=github:microsoft/pxt-jacdac")

    // ensure unique deps
    meta.dependencies = unique(meta.dependencies)

    // sniff target
    if (!meta.editor) {
        if (/basic\.show/.test(code)) meta.editor = "microbit"
    }

    return {
        code,
        meta,
    }
}
