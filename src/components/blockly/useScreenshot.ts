import { WorkspaceSvg, ContextMenuRegistry, Blocks } from "blockly"
import { useContext, useEffect } from "react"
import { DS_EDITOR_ID } from "../dom/constants"
import { delay } from "../dom/utils"
import { UIFlags } from "../uiflags"
import BlockContext from "./BlockContext"
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    ContentDefinition,
} from "./toolbox"

function svgToPng(data: string, width: number, height: number) {
    return new Promise<string>((resolve, reject) => {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const img = new Image()

        const pixelDensity = 4
        canvas.width = width * pixelDensity
        canvas.height = height * pixelDensity
        img.onload = function () {
            context.drawImage(
                img,
                0,
                0,
                width,
                height,
                0,
                0,
                canvas.width,
                canvas.height
            )
            try {
                const dataUri = canvas.toDataURL("image/png")
                resolve(dataUri)
            } catch (err) {
                console.warn("Error converting the workspace svg to a png")
                reject(err)
            }
        }
        img.src = data
    })
}

export async function workspaceToPng(workspace: WorkspaceSvg, customCss = "") {
    // Go through all text areas and set their value.
    const textAreas = document.getElementsByTagName("textarea")
    for (let i = 0; i < textAreas.length; i++) {
        textAreas[i].innerHTML = textAreas[i].value
    }

    const bBox = workspace.getBlocksBoundingBox()
    const x = bBox.left
    const y = bBox.top
    const width = bBox.right - x
    const height = bBox.bottom - y

    const blockCanvas = workspace.getCanvas()
    const clone = blockCanvas.cloneNode(true) as HTMLCanvasElement
    clone.removeAttribute("transform")

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.appendChild(clone)
    svg.setAttribute("viewBox", x + " " + y + " " + width + " " + height)

    svg.setAttribute(
        "class",
        "blocklySvg " +
            (workspace.options.renderer || "geras") +
            "-renderer " +
            (workspace.getTheme ? workspace.getTheme().name + "-theme" : "")
    )
    svg.setAttribute("width", width + "")
    svg.setAttribute("height", height + "")
    svg.setAttribute("style", "background-color: transparent")

    const css = [].slice
        .call(document.head.querySelectorAll("style"))
        .filter(function (el) {
            return (
                /\.blocklySvg/.test(el.innerText) ||
                el.id.indexOf("blockly-") === 0
            )
        })
        .map(function (el) {
            return el.innerText
        })
        .join("\n")
    const style = document.createElement("style")
    style.innerHTML = css + "\n" + customCss
    svg.insertBefore(style, svg.firstChild)

    let svgAsXML = new XMLSerializer().serializeToString(svg)
    svgAsXML = svgAsXML.replace(/&nbsp/g, "&#160")
    const data = "data:image/svg+xml," + encodeURIComponent(svgAsXML)

    const datauri = await svgToPng(data, width, height)
    return datauri
}

export function useScreenshotContextMenu() {
    const { workspace, loadWorkspaceFile, toolboxConfiguration } =
        useContext(BlockContext)
    const id = "dse_screenshot"

    useEffect(() => {
        if (!UIFlags.screenshot) return
        ContextMenuRegistry.registry.register({
            callback: generateDocumentationScreenshots,
            preconditionFn: () => "enabled",
            scopeType: ContextMenuRegistry.ScopeType.WORKSPACE,
            displayText: "Generate documentation screenshots",
            weight: 1000,
            id,
        })
        return () => ContextMenuRegistry.registry.unregister(id)
    }, [workspace])

    async function generateDocumentationScreenshots() {
        const dir = await window.showDirectoryPicker({ mode: "readwrite" })
        if (!dir) return

        const md = ["# Blocks"]
        try {
            for (const node of toolboxConfiguration.contents)
                await visitNode(node)
        } finally {
            await writeMardown()
        }

        async function writeMardown() {
            const file = await dir.getFileHandle(`reference.md`, {
                create: true,
            })
            const writable = await file.createWritable({
                keepExistingData: false,
            })
            await writable.write(md.filter(l => l !== undefined).join("\n"))
            await writable.close()
        }

        async function visitNode(node: ContentDefinition) {
            switch (node.kind) {
                case "category":
                    await visitCategory(node as CategoryDefinition)
                    break
                case "block":
                    await visitBlock(node as BlockReference)
                    break
            }
        }

        async function visitCategory(cat: CategoryDefinition) {
            md.push(`## ${cat.name}`, "")
            if (cat.contents)
                for (const child of cat.contents) await visitNode(child)
        }

        async function visitBlock(block: BlockReference) {
            const { type } = block
            const def = (Blocks[type] as any)?.definition as BlockDefinition
            if (!def) return

            const { message0, tooltip } = def || {}
            const name = message0
            await renderBlock(dir, block)
            md.push(
                `### ${name} {#${type}}`,
                "",
                tooltip,
                "",
                `![Snapshot of the ${name} block](/images/blocks/${type}.png)`,
                ""
            )
        }
    }

    async function renderBlock(
        dir: FileSystemDirectoryHandle,
        block: BlockReference
    ) {
        const { type } = block
        const def = (Blocks[type] as any).definition as BlockDefinition
        const blockxml =
            def?.blockxml ||
            `<block type="${type}">${Object.keys(def?.values || [])
                .map(name => {
                    const { type } = def.values[name]
                    const shadow = type !== "variables_get"
                    return `<value name="${name}"><${
                        shadow ? "shadow" : "field"
                    } type="${type}" /></value>`
                })
                .join("\n")}</block>`
        // load payload
        loadWorkspaceFile({
            editor: DS_EDITOR_ID,
            xml: `<xml xmlns="http://www.w3.org/1999/xhtml">${blockxml}</xml>`,
        })
        // wait render done
        await delay(100)
        // render screenshot
        const png = await workspaceToPng(workspace)
        // save to file
        await writeImage(dir, png, type)
    }

    async function writeImage(
        dir: FileSystemDirectoryHandle,
        png: string,
        name: string
    ) {
        try {
            const blob = await (await fetch(png)).blob()
            const fn = `${name}.png`
            const file = await dir.getFileHandle(fn, { create: true })
            const writable = await file.createWritable({
                keepExistingData: false,
            })
            await writable.write(blob)
            await writable.close()
            console.debug(`generated ${fn}`)
        } catch (e) {
            console.error(`error image ${name}`, e)
        }
    }
}
