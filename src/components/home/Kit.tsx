import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import FeatureItem from "./FeatureItem"

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
                        description="Power up the micro:bit and plug the cables and modules!"
                        buttonText="Unbox your kit"
                        buttonUrl="/hardware/kit/unbox"
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
                        buttonText="Explore the dashboard"
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
                        description="Code Jacdac into your micro:bit V2."
                        buttonText="Build with MakeCode"
                        buttonUrl="/clients/makecode"
                    />
                </Grid>
            </CarouselGrid>
        </Grid>
    )
}
