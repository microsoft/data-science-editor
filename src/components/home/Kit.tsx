import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
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
                title="Kit"
                subtitle3="Hardware Module Kit"
                imageColumns={6}
                image={
                    <StaticImage
                        src="./kittop.jpg"
                        alt="Kit cardboard view from top"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Explore"
                subtitle3="Use the dashboard to interact with modules in the browser."
                imageColumns={6}
                image={
                    <StaticImage
                        src="./kitdashboard.png"
                        alt="Dashboard with a cartoonified laptop in front"
                    />
                }
                buttonText="Dashboard"
                buttonUrl="/dashboard"
            />

            <SplitGrid
                right={false}
                subtitle="Build"
                description="Code Jacdac into your micro:bit V2, Arcade or Maker board."
                buttonText="MakeCode"
                buttonUrl="/clients/makecode"
                image={
                    <StaticImage
                        src="./makecode.png"
                        alt="Block code to swipe a servo"
                    />
                }
            />
        </Grid>
    )
}
