import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CenterGrid from "../../../components/home/CenterGrid"
import SplitGrid from "../../../components/home/SplitGrid"
import { FEEDBACK_URL } from "../../../components/shell/DataEditorAppBar"

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
                buttonUrl="https://green-rock-09efbc210.azurestaticapps.net/hosted_files/dataset.xlsx"
            />
            <CenterGrid
                subtitle3="Drag blocks to build a data analysis pipeline within Excel."
                description="Drag, Drop, Analyze."
            />

            <SplitGrid
                right={true}
                imageColumns={8}
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
                imageColumns={8}
                subtitle="Visualize"
                description="Drag a chart block to visualize your data."
                image={
                    <StaticImage
                        src="./chart.png"
                        alt="A scatter plot of pinguins"
                    />
                }
            />

            <SplitGrid
                right={true}
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
                right={false}
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

            <CenterGrid
                subtitle="Where can I try this editor?"
                description="Yes! Download the worksheet and follow the instructions to get started."
                buttonVariant="link"
                buttonText="Download Worksheet"
                buttonUrl="https://green-rock-09efbc210.azurestaticapps.net/hosted_files/dataset.xlsx"
            />

            <CenterGrid
                subtitle="Community"
                description="Please tell us what you think of the editor on our forum."
                buttonText="Go to forum"
                buttonVariant="link"
                buttonUrl={FEEDBACK_URL}
            />
        </Grid>
    )
}
