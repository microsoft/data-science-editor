import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"

export default function Kit() {
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Hardware Kit"
                subtitle3="Start experimenting with Jacdac and the Hardware module kit."
                imageColumns={6}
                image={
                    <StaticImage
                        src="./kit/topfront.jpg"
                        alt="Kit cardboard view from top"
                    />
                }
            />
            <CarouselGrid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                src="./kit/opentopside.jpg"
                                alt="Hardware kit box opened with contents on a table"
                            />
                        }
                        subtitle2="Unbox"
                        description="Use the dashboard to interact with modules in the browser."
                        buttonText="Modules"
                        buttonUrl="/hardware/kit/modules"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                src="./dashboardkit.png"
                                alt="Jacdac devices connected to a computer with a dashboard"
                            />
                        }
                        subtitle2="Explore"
                        description="Use the dashboard to interact with modules in the browser."
                        buttonText="Dashboard"
                        buttonUrl="/dashboard"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                src="./makecode.png"
                                alt="Block code to swipe a servo"
                            />
                        }
                        subtitle="Build"
                        description="Code Jacdac into your micro:bit V2, Arcade or Maker board."
                        buttonText="MakeCode"
                        buttonUrl="/clients/makecode"
                    />
                </Grid>
            </CarouselGrid>
        </Grid>
    )
}
