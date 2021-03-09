import { Link } from "gatsby-theme-material-ui";
import React, { useMemo } from "react";
import { deviceSpecificationToDTDL } from "../../jacdac-ts/src/azure-iot/dtdl";
import Snippet from "./ui/Snippet";

export function DeviceDTDLSnippet(props: { dev: jdspec.DeviceSpec, inlineServices?: boolean }) {
    const { dev, inlineServices } = props;

    const dtdl = useMemo<string>(
        () => JSON.stringify(deviceSpecificationToDTDL(dev, { inlineServices }), null, 2),
        [dev]);

    return <Snippet value={dtdl} mode="json" download={`${dev.name}.json`}
        caption={<><Link to="/dtmi">DTDL</Link> is an open source modelling language developed by Microsoft Azure.</>} />
}