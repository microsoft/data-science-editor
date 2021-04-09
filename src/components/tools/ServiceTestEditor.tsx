import React, { useContext, useEffect, useMemo } from "react"
import { Button, Grid } from "@material-ui/core"
import { parseSpecificationTestMarkdownToJSON } from "../../../jacdac-ts/jacdac-spec/spectool/jdtest"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import useLocalStorage from "../useLocalStorage"
import HighlightTextField from "../ui/HighlightTextField"
import ServiceSpecificationSelect from "../ServiceSpecificationSelect"
import { SRV_BUTTON } from "../../../jacdac-ts/src/jdom/constants"
import ServiceTest from "../test/ServiceTest"
import { fetchText } from "../github"
import AppContext from "../AppContext"
import Markdown from "../ui/Markdown"

const SERVICE_TEST_SERVICE_STORAGE_KEY = "jacdac:servicetesteditor:service"
const SERVICE_TEST_SOURCE_STORAGE_KEY = "jacdac:servicetesteditorsource"
const SERVICE_MARKDOWN_SOURCE_STORAGE_KEY = "jacdac:servicetesteditorsource:markdown"

export default function ServiceTestEditor() {
    const { setError } = useContext(AppContext)
    const [serviceClass, setServiceClass] = useLocalStorage<number>(SERVICE_TEST_SERVICE_STORAGE_KEY, SRV_BUTTON)
    const [source, setSource] = useLocalStorage(SERVICE_TEST_SOURCE_STORAGE_KEY, "")
    const [markdownSource, setMarkdownSource] = useLocalStorage(SERVICE_MARKDOWN_SOURCE_STORAGE_KEY, "")
    const serviceSpec = useMemo(
        () => serviceSpecificationFromClassIdentifier(serviceClass),
        [serviceClass]
    )
    const json = useMemo(
        () => parseSpecificationTestMarkdownToJSON(source, serviceSpec),
        [source, serviceSpec]
    )
    const servicePath =
        json &&
        `services/tests/${(
            serviceSpec.camelName ||
            serviceSpec.shortId ||
            `0x${serviceSpec.classIdentifier.toString(16)}`
        ).toLowerCase()}`
    const handleLoadFromGithub = async () => {
        try {
            const ghSource = await fetchText(
                "microsoft/jacdac",
                "main",
                `services/tests/${serviceSpec.shortId}.md`,
                "text/plain"
            )
            if (ghSource)
                setSource(ghSource)
            else
                setError("Specification source not found")
        } catch (e) {
            setError(e)
        }
        try {
            const ghSource = await fetchText(
                "microsoft/jacdac",
                "main",
                `services/${serviceSpec.shortId}.md`,
                "text/plain"
            )
            if (ghSource)
                setMarkdownSource(ghSource)
            else
                setError("Test source not found")
        } catch (e) {
            setError(e)
        }
    }
    return (
        <Grid spacing={2} container>
            <Grid item xs={12}>
                <Grid container spacing={2} direction="row">
                    <Grid item>
                        <ServiceSpecificationSelect
                            label={"Select a service to test"}
                            serviceClass={serviceClass}
                            setServiceClass={setServiceClass}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            disabled={!serviceSpec}
                            onClick={handleLoadFromGithub}
                        >
                            Load tests from GitHub
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid spacing={2} container>
                <Grid item xs={6} xl={5}>
                    <HighlightTextField
                        code={source}
                        language={"markdown"}
                        onChange={setSource}
                        annotations={json?.errors}
                        pullRequestTitle={
                            json && `Service test: ${serviceSpec.name}`
                        }
                        pullRequestPath={servicePath}
                    />
                </Grid>
                <Grid item xs={6} xl={5}>
                    <Markdown source={markdownSource} />
                </Grid>
            </Grid>
            {json && (
                <Grid item xs={12} xl={7}>
                    <ServiceTest showStartSimulator={true} serviceSpec={serviceSpec} serviceTest={json} />
                </Grid>
            )}
        </Grid>
    )
}
