import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { lazy, Suspense, useMemo } from "react"
import { deviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import CenterGrid from "./CenterGrid"
import SplitGrid from "./SplitGrid"
const DeviceSpecificationList = lazy(
    () => import("../specification/DeviceSpecificationList")
)

export default function KitModules() {
    const modules = useMemo(
        () =>
            deviceSpecifications().filter(
                spec => spec.tags?.indexOf("kit") > -1
            ),
        []
    )
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
            style={{ marginTop: 0 }}
        >
            <SplitGrid
                style={{ paddingTop: 0 }}
                title="Kit Modules"
                subtitle3="Explore the contents of the kit."
                imageColumns={6}
                image={
                    <StaticImage
                        src="./kit/contents.jpg"
                        alt="All the contents of the hardware kit"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="Plug and Play"
                description="The micro:bit V2 from the Kit comes with firmware that will automatically use any of the modules in your kit."
                caption="Slot the micro:bit in the Jacdapter then try to connect various modules to see what happens."
                buttonUrl="/hardware/kit/oob/"
                buttonVariant="link"
                buttonText="Download again"
                image={
                    <StaticImage
                        src="./kit/opentopside.jpg"
                        alt="Kit opened with micro:bit visible"
                    />
                }
            />

            <CenterGrid
                subtitle="Modules"
                caption="Your kit may contain some but not all of these modules."
            />
            <Grid item xs={12}>
                <Suspense fallback={null}>
                    <DeviceSpecificationList devices={modules} />
                </Suspense>
            </Grid>

            <Grid item xs={12}>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Grid>
                            <StaticImage
                                src="./kit/opentop.jpg"
                                alt="Kit opened with micro:bit"
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StaticImage
                            src="./kit/sidetop.jpg"
                            alt="Side top image of the kit"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StaticImage
                            src="./kit/sidetop2.jpg"
                            alt="Reverse side top image of the kit"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StaticImage
                            src="./kit/top.jpg"
                            alt="Top image of the kit"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Grid>
                            <StaticImage
                                src="./kit/topfront.jpg"
                                alt="top front image of the kit"
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Grid>
                            <StaticImage
                                src="./kit/bottom.jpg"
                                alt="bottom of the kit"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
