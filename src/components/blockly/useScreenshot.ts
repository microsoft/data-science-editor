import { WorkspaceSvg, ContextMenuRegistry } from "blockly"
import { useContext, useEffect } from "react"
import { UIFlags } from "../uiflags"
import BlockContext from "./BlockContext"

function svgToPng(data: string, width: number, height: number) {
    return new Promise<string>((resolve, reject) => {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const img = new Image()

        const pixelDensity = 10
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

export async function downloadWorkspaceScreenshot(
    workspace: WorkspaceSvg,
    name: string
) {
    const datauri = await workspaceToPng(workspace)
    const a = document.createElement("a")
    a.download = `${name}.png`
    a.target = "_self"
    a.href = datauri
    document.body.appendChild(a)
    a.click()
    a.parentNode.removeChild(a)
}

export function useScreenshotContextMenu() {
    const { workspace } = useContext(BlockContext)
    const id = "dse_screenshot"

    useEffect(() => {
        if (!UIFlags.screenshot) return
        ContextMenuRegistry.registry.register({
            callback: () => {
                downloadWorkspaceScreenshot(workspace, "datablocks")
            },
            preconditionFn: () => "enabled",
            scopeType: ContextMenuRegistry.ScopeType.WORKSPACE,
            displayText: "Snapshot to Image",
            weight: 1000,
            id,
        })
        return () => ContextMenuRegistry.registry.unregister(id)
    }, [workspace])
}
