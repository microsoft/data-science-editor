import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "../../../components/home/CarouselGrid"
import CenterGrid from "../../../components/home/CenterGrid"
import FeatureItem from "../../../components/home/FeatureItem"
import SplitGrid from "../../../components/home/SplitGrid"
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus"
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck"
import FindReplaceIcon from "@material-ui/icons/FindReplace"
import SubscriptionsIcon from "@material-ui/icons/Subscriptions"

export default function Home() {
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                hideJacdacIcon={true}
                title="Data Science Editor"
                subtitle="for Excel"
                imageColumns={6}
                image={
                    <StaticImage src="./hero.png" alt="Many Modules Together" />
                }
                buttonText="Download Worksheet"
                buttonUrl="https://green-rock-09efbc210.azurestaticapps.net/hosted_files/cereal.xlsx"
            />
            <CenterGrid
                subtitle3="Drag blocks to build a data analysis pipeline without Excel."
                description="Drag, Drop, Analyze."
            />

            <SplitGrid
                right={true}
                subtitle="Tell a data story"
                description="Follow the blocks to see how the data is analyzed."
                image={
                    <StaticImage
                        src="./story.png"
                        alt="A sequence of blocks that charts sorted data."
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="👀 every step"
                description="Inspect before and after data on every computation block."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./preview.png"
                        alt="A preview of the data before and after a block"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Discover"
                description="Discover how to compute with data using an intuitive block-based editor."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./discover.png"
                        alt="A drawer of statistics blocks"
                    />
                }
            />
        </Grid>
    )
}
