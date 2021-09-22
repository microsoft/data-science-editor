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
            <FeatureItem
                title="Hardware Kit"
                subtitle3="Start experimenting with Jacdac and the Hardware module kit."
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
                        description="Explore the contents of the kit."
                        buttonText="Modules"
                        buttonUrl="/hardware/kit/modules"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                src="./kit/dashboard.jpg"
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
                                src="./kit/makecode.jpg"
                                alt="Block code to swipe a servo"
                            />
                        }
                        subtitle2="Build"
                        description="Code Jacdac into your micro:bit V2, Arcade or Maker board."
                        buttonText="MakeCode"
                        buttonUrl="/clients/makecode"
                    />
                </Grid>
            </CarouselGrid>
        </Grid>
    )
}
