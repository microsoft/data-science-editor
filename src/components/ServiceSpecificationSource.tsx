import React, { useState } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { serviceSpecificationFromClassIdentifier } from '../../jacdac-ts/src/jdom/spec';
import { Paper, createStyles, makeStyles, Theme } from '@material-ui/core';
import TabPanel, { a11yProps } from './ui/TabPanel';
import Snippet from './ui/Snippet';
import { converters } from '../../jacdac-ts/jacdac-spec/spectool/jdspec'
import ServiceSpecification from './ServiceSpecification';
import { DTMIToRoute, serviceSpecificationDTMI, serviceSpecificationToDTDL } from '../../jacdac-ts/src/azure-iot/dtdl'
import { Link } from 'gatsby-theme-material-ui';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        marginBottom: theme.spacing(1)
    },
    pre: {
        margin: "0",
        padding: "0",
        backgroundColor: "transparent",
        whiteSpec: "pre-wrap"
    }
}));

export default function ServiceSpecificationSource(props: {
    classIdentifier?: number,
    serviceSpecification?: jdspec.ServiceSpec,
    showSpecification?: boolean
}) {
    const { classIdentifier, serviceSpecification, showSpecification } = props;
    const classes = useStyles();
    const [tab, setTab] = useState(0);
    const spec = serviceSpecification || serviceSpecificationFromClassIdentifier(classIdentifier)
    const convs = converters();
    const showDTDL = spec?.camelName !== "system"

    const handleTabChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
        setTab(newValue);
    };

    let index = 0;
    return (
        <div className={classes.root}>
            <Paper square>
                <Tabs value={tab} onChange={handleTabChange} aria-label="View specification formats">
                    {[
                        showSpecification && "Specification",
                        "MakeCode",
                        "TypeScript",
                        "C",
                        "JSON",
                        showDTDL && "Module Twin"
                    ]
                        .filter(n => !!n)
                        .map((n, i) => <Tab key={n} label={n} {...a11yProps(i)} />)}
                </Tabs>
                {showSpecification && <TabPanel key="spec" value={tab} index={index++}>
                    <ServiceSpecification service={spec} />
                </TabPanel>}
                {["sts", "ts", "c", "json"].map((lang) =>
                    <TabPanel key={`conv${lang}`} value={tab} index={index++}>
                        <Snippet value={() => convs[lang](spec)} mode={lang} />
                    </TabPanel>)}
                {showDTDL && <TabPanel key="dtdl" value={tab} index={index++}>
                    <Snippet value={() => JSON.stringify(serviceSpecificationToDTDL(spec), null, 2)} mode={"json"}
                        download={`dtmi-${spec.shortId}.json`}
                        url={"/" + DTMIToRoute(serviceSpecificationDTMI(spec))}
                        caption={<><Link to="/dtmi">DTDL</Link> is an open source modelling language developed by Microsoft Azure.</>} />
                </TabPanel>}
            </Paper>
        </div>
    );
}
