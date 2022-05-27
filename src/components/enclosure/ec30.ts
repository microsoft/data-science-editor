import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"

export const DEFAULT_OPTIONS: EnclosureOptions = {
    legs: {
        type: "well",
    },
    cover: {},
}

export function isEC30(shape: jdspec.Shape) {
    return typeof shape === "string" && /^ec30_/.test(shape)
}

export function generateEC30EnclosureModel(
    gridWidth: number,
    gridHeight: number,
    depth = 6
): EnclosureModel {
    const width = gridWidth * 10
    const height = gridHeight * 10
    const c = 8
    const boxWidth = width + c
    const boxHeight = height + c
    return {
        name: `${width}x${height}`,
        box: {
            width: boxWidth,
            height: boxHeight,
            depth,
        },
        rings: [
            {
                x: width >> 1,
                y: height >> 1,
            },
            {
                x: width >> 1,
                y: -(height >> 1),
            },
            {
                x: -(width >> 1),
                y: -(height >> 1),
            },
            {
                x: -(width >> 1),
                y: height >> 1,
            },
        ],
        components: [
            {
                x: -(width >> 1) + 1.5,
                y: 0,
                type: "led",
            },
            {
                x: (width >> 1) - 1.5,
                y: 0,
                type: "led",
            },
            {
                x: 0,
                y: -(height >> 1) + 1.5,
                type: "led",
            },
            {
                x: 0,
                y: (height >> 1) - 1.5,
                type: "led",
            },
        ],
        connectors: [
            {
                x: 0,
                y: -(width >> 1) + 2,
                dir: "bottom",
                type: "jacdac",
            },
            {
                x: 0,
                y: (width >> 1) - 2,
                dir: "top",
                type: "jacdac",
            },
            {
                x: -(width >> 1) + 2,
                y: 0,
                dir: "left",
                type: "jacdac",
            },
            {
                x: (width >> 1) - 2,
                y: 0,
                dir: "right",
                type: "jacdac",
            },
        ],
    }
}

export function shapeToEC30(shape: jdspec.Shape, depth: number) {
    if (typeof shape === "string") {
        const m = /^ec30_(\d+)x(\d+)_([lrup\d]+)$/.exec(shape)
        if (m) {
            const w = Number(m[1])
            const h = Number(m[2])
            return generateEC30EnclosureModel(w, h, depth)
        }
    }
    return undefined
}
