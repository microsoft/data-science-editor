import { primitives, transforms, booleans } from "@jscad/modeling"
import { Geom3 } from "@jscad/modeling/src/geometries/types"
import stlSerializer from "@jscad/stl-serializer"
const { cuboid, cylinder, roundedCuboid } = primitives
const { translate, rotateZ } = transforms
const { union, subtract } = booleans

const connectorSpecs = {
    jacdac: {
        width: 9.8,
        height: 5.1,
        offset: [0, 0, 0],
    },
    usbc: {
        width: 10.5,
        height: 3.5,
        z: 0,
        offset: [0, 0, 2],
    },
}
const dirAngles = {
    top: 0,
    bottom: 180,
    left: 90,
    right: -90,
}

const ringGap = 2.5
const ringRadius = 3.55 / 2
const pcbWidth = 1.6
const snapHeight = 1.5

const wall = pcbWidth
const wallRadius = wall / 2
const segments = 32
const legSegments = 64
const snapRadius = 2.5
const notchRadius = 1

export interface EnclosureModel {
    name: string
    grid: {
        width: number
        height: number
    }
    box: {
        width: number
        height: number
        depth: number
    }
    rings: {
        x: number
        y: number
        notch?: "top" | "bottom" | "left" | "right"
    }[]
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
        radius?: number
        height?: number
        hole?: number
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

export const convert = (m: EnclosureModel, options: EnclosureOptions = {}) => {
    const { box, rings, connectors, components } = m
    const { width, height, depth } = box
    const { cover, legs, printPrecision = 0.4 } = options

    let coverModel: Geom3
    // box
    let model = roundedCuboid({
        size: [width + wall * 2, height + wall * 2, depth + wall * 2],
        center: [0, 0, depth / 2 + wall],
        roundRadius: wallRadius * 2,
        segments,
    })

    // add screw mounts
    if (legs?.type === "well") {
        const mountRadius = legs.radius || 5
        const mountRoundRadius = 0.5
        const mountCenterRadius = legs.hole || 1.5
        const mountHeight = legs.height || 4.5

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
            cuboid({
                size: [width, height, depth + 3 * wall],
                center: [0, 0, depth / 2 + 2 * wall],
            }),
            cuboid({
                size: [width + wall, height + wall, wall],
                center: [0, 0, depth + wall + wall / 2],
            }),
            cuboid({
                size: [10, 10, wall],
                center: [0, height / 2, depth + wall + wall / 2],
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
                    radius: ringRadius + printPrecision,
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
        const { offset } = conn || [0, 0, 0]
        const d = 24
        return translate(
            [x + offset[0], y + offset[1], pcbWidth / 2 + wall + offset[2]],
            rotateZ(
                dirAngle,
                roundedCuboid({
                    size: [conn.width, d, conn.height],
                    roundRadius: conn.height / 2 - 0.5,
                    segments: 32,
                    center: [
                        0,
                        d / 2,
                        conn.height / 2 - snapHeight + printPrecision,
                    ],
                })
            )
        )
    }
    model = subtract(
        model,
        union(connectors.map(c => connector(c.x, c.y, c.dir, c.type)))
    )

    // add snap fit ring mounts
    const snap = (x: number, y: number, h: number, hc: number) =>
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
                    segments: segments >> 1,
                })
            )
        )
    const mounts: {
        x: number
        y: number
        h: number
        hc: number
        notch?: "top" | "bottom" | "left" | "right"
    }[] = [
        ...rings.map(p => ({
            ...p,
            h: snapHeight,
            hc: pcbWidth + printPrecision / 2,
        })),
        ...(cover?.mounts?.type === "ring"
            ? coverSnaps.map(p => ({ ...p, h: depth, hc: wall }))
            : []),
    ]
    model = union(
        model,
        ...mounts.map(ring => snap(ring.x, ring.y, ring.h, ring.hc))
    )
    const notches = mounts.filter(m => m.notch)
    if (notches.length) {
        const notchx = {
            left: -1,
            right: 1,
            top: 0,
            bottom: 0,
        }
        const notchy = {
            left: 0,
            right: 1,
            top: 1,
            bottom: -1,
        }
        model = union(
            model,
            ...notches.map(({ x, y, notch, h, hc }) =>
                translate(
                    [
                        x + notchx[notch] * (snapRadius + notchRadius),
                        y + notchy[notch] * (snapRadius - notchRadius),
                        0,
                    ],
                    cylinder({
                        radius: notchRadius - printPrecision / 2,
                        height: h + hc + wall,
                        center: [0, 0, (h + hc + wall) / 2],
                        segments: segments >> 1,
                    })
                )
            )
        )
    }

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                stlSerializer.serialize({ binary: false } as any, geometry)
            )
    )
}
