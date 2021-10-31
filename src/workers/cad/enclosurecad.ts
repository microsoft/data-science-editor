import { primitives, transforms, booleans, colors } from "@jscad/modeling"
import { Geom3 } from "@jscad/modeling/src/geometries/types"
import stlSerializer from "@jscad/stl-serializer"
const { cuboid, cylinder, roundedCuboid } = primitives
const { translate, rotateZ } = transforms
const { union, subtract } = booleans

const connectorSpecs = {
    jacdac: {
        width: 10,
        height: 5,
    },
    usbc: {
        width: 10,
        height: 3,
    },
}
const dirAngles = {
    top: 0,
    bottom: 180.000001,
    left: -90,
    right: 90,
}

const ringGap = 2.5
const ringRadius = 2.15 / 2
const pcbWidth = 1.6
const snapHeight = 1.5

const wall = pcbWidth
const wallRadius = wall / 2
const segments = 32
const legSegments = 64
const snapRadius = 2.1
const mountRadius = 4
const mountRoundRadius = 0.5
const mountCenterRadius = 1
const mountHeight = 5

export interface EnclosureModel {
    box: {
        width: number
        height: number
        depth: number
    }
    rings: { x: number; y: number }[]
    components?: {
        x: number
        y: number
        radius?: number
        type: "led" | "reset" | "circle" | "square"
    }[]
    connectors: {
        x: number
        y: number
        dir: "top" | "bottom" | "left" | "right"
        type: "jacdac" | "usbc"
    }[]
}

export interface EnclosureOptions {
    legs?: {
        type?: "well"
    }
    cover?: {
        mounts?: {
            type?: "ring"
        }
    }
    printPrecision?: number
}

export interface EnclosureFile {
    name: string
    blob: Blob
}

const modules: EnclosureModel[] = [
    {
        box: {
            width: 22,
            height: 29,
            depth: 10,
        },
        rings: [
            {
                x: 7.5,
                y: 7.5,
            },
            {
                x: -7.5,
                y: -7.5,
            },
            {
                x: -7.5,
                y: 7.5,
            },
            {
                x: 7.5,
                y: -7.5,
            },
        ],
        components: [
            {
                x: 0,
                y: 7,
                type: "led",
            },
            {
                x: 0,
                y: 0,
                type: "circle",
                radius: 2,
            },
        ],
        connectors: [
            {
                x: 0,
                y: 7.5,
                dir: "top",
                type: "jacdac",
            },
            {
                x: 0,
                y: 7.5,
                dir: "bottom",
                type: "jacdac",
            },
        ],
    },
    {
        box: {
            width: 40,
            height: 60,
            depth: 10,
        },
        rings: [
            {
                x: 5,
                y: 12.5,
            },
            {
                x: -5,
                y: -12.5,
            },
            {
                x: -5,
                y: 12.5,
            },
            {
                x: 5,
                y: -12.5,
            },
        ],
        connectors: [
            {
                x: 0,
                y: 26,
                dir: "top",
                type: "jacdac",
            },
            {
                x: 16,
                y: 0,
                dir: "left",
                type: "jacdac",
            },
            {
                x: -16,
                y: 0,
                dir: "right",
                type: "jacdac",
            },
            {
                x: -16,
                y: connectorSpecs.jacdac.width,
                dir: "right",
                type: "jacdac",
            },
            {
                x: 0,
                y: -26,
                dir: "bottom",
                type: "usbc",
            },
        ],
    },
]

export const convert = (m: EnclosureModel, options: EnclosureOptions = {}) => {
    const { box, rings, connectors, components } = m
    const { width, height, depth } = box
    const { cover, legs, printPrecision = 0.55 } = options

    let coverModel: Geom3
    // box
    let model = union(
        roundedCuboid({
            size: [width + wall * 2, height + wall * 2, depth + wall * 2],
            center: [0, 0, depth / 2 + wall],
            roundRadius: wallRadius * 2,
            segments,
        }),
        cuboid({
            size: [width + wall * 2, height + wall * 2, wall],
            center: [0, 0, wall / 2],
        })
    )

    // add screw mounts
    if (legs?.type === "well") {
        const post = (x, y, sign) =>
            translate(
                [x, y, mountHeight / 2],
                subtract(
                    subtract(
                        union(
                            cylinder({
                                radius: mountRadius,
                                height: mountHeight,
                                segments: legSegments,
                            }),
                            cuboid({
                                size: [
                                    mountRadius * 2,
                                    mountRadius + wall,
                                    mountHeight - mountRoundRadius * 2,
                                ],
                                center: [
                                    0,
                                    (-sign * (mountRadius + wall)) / 2,
                                    -mountRoundRadius,
                                ],
                            })
                        ),
                        cylinder({
                            radius: mountRadius - wall,
                            height: mountHeight + wall,
                            center: [0, 0, wall],
                            segments: legSegments,
                        })
                    ),
                    cylinder({
                        radius: mountCenterRadius,
                        height: mountHeight,
                        center: [0, 0, -wall],
                        segments,
                    })
                )
            )
        model = union(
            model,
            post(
                -width / 2 + mountRadius - wall,
                -height / 2 - mountRadius - wall / 2,
                -1
            ),
            post(
                width / 2 - mountRadius + wall,
                height / 2 + mountRadius + wall / 2,
                1
            ),
            post(
                -width / 2 + mountRadius - wall,
                height / 2 + mountRadius + wall / 2,
                1
            ),
            post(
                width / 2 - mountRadius + wall,
                -height / 2 - mountRadius - wall / 2,
                -1
            )
        )
    }

    // substract empty box, top, notch
    model = subtract(
        model,
        union(
            roundedCuboid({
                size: [width, height, depth + 3 * wall],
                center: [0, 0, depth / 2 + 2 * wall],
                segments,
            }),
            cuboid({
                size: [width + wall, height + wall, wall],
                center: [0, 0, depth + wall + wall / 2],
            }),
            cuboid({
                size: [5, 5, wall],
                center: [-width / 2, 0, depth + wall + wall / 2],
            })
        )
    )

    // subtract notch for screwdriver

    const coverSnaps = [
        {
            x: -width / 2 + ringGap,
            y: -height / 2 + ringGap,
        },
        {
            x: width / 2 - ringGap,
            y: -height / 2 + ringGap,
        },
        {
            x: width / 2 - ringGap,
            y: height / 2 - ringGap,
        },
        {
            x: -width / 2 + ringGap,
            y: height / 2 - ringGap,
        },
    ]
    if (cover) {
        const { mounts } = cover
        const coverSnap = (x: number, y: number) =>
            translate(
                [x, y, 0],
                cylinder({
                    radius: ringRadius + printPrecision / 2,
                    height: 2 * wall,
                    center: [0, 0, wall / 2],
                    segments,
                })
            )
        coverModel = roundedCuboid({
            size: [
                width + wall - printPrecision,
                height + wall - printPrecision,
                wall,
            ],
            roundRadius: printPrecision / 2,
        })
        if (components)
            coverModel = subtract(
                coverModel,
                union(
                    components.map(({ x, y, radius, type }) =>
                        translate(
                            [x, y, 0],
                            type === "square"
                                ? cuboid({
                                      size: [
                                          2 * (radius || ringRadius),
                                          2 * (radius || ringRadius),
                                          2 * wall,
                                      ],
                                      center: [0, 0, wall / 2],
                                  })
                                : cylinder({
                                      radius:
                                          (radius || ringRadius) +
                                          printPrecision / 2,
                                      height: 2 * wall,
                                      center: [0, 0, wall / 2],
                                      segments,
                                  })
                        )
                    )
                )
            )
        if (mounts?.type === "ring") {
            coverModel = subtract(
                coverModel,
                union(coverSnaps.map(ring => coverSnap(ring.x, ring.y)))
            )
        }
    }

    // remove jacdac connectors
    const connector = (x, y, dir, type) => {
        const conn = connectorSpecs[type]
        const dirAngle = (dirAngles[dir] / 180) * Math.PI
        const d = 24
        return translate(
            [x, y, snapHeight + pcbWidth / 2 + wall],
            rotateZ(
                dirAngle,
                roundedCuboid({
                    size: [conn.width, d, conn.height],
                    roundRadius: conn.height / 2 - 0.5,
                    segments: 32,
                    center: [0, d / 2, conn.height / 2],
                })
            )
        )
    }
    model = subtract(
        model,
        union(connectors.map(c => connector(c.x, c.y, c.dir, c.type)))
    )

    // add snap fit ring mounts
    const snap = (x, y, h, hc) =>
        union(
            translate(
                [x, y, 0],
                cylinder({
                    radius: snapRadius,
                    height: h + wall,
                    center: [0, 0, (h + wall) / 2],
                    segments,
                })
            ),
            translate(
                [x, y, wall],
                cylinder({
                    radius: ringRadius - printPrecision / 2,
                    height: hc,
                    center: [0, 0, h + hc / 2],
                    segments,
                })
            )
        )
    const mounts = [
        ...rings.map(p => ({ ...p, h: snapHeight, hc: pcbWidth })),
        ...(cover?.mounts?.type === "ring"
            ? coverSnaps.map(p => ({ ...p, h: depth, hc: wall }))
            : []),
    ]
    model = union(
        model,
        ...mounts.map(ring => snap(ring.x, ring.y, ring.h, ring.hc))
    )

    return [model, coverModel].filter(m => !!m)
}

export function convertToSTL(
    model: EnclosureModel,
    options?: EnclosureOptions
) {
    const geometries = convert(model, options)
    return geometries.map(
        geometry =>
            new Blob(
                stlSerializer.serialize({ binary: false } as any, geometry)
            )
    )
}
