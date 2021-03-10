import React, { lazy, useMemo } from "react";
import { Link } from "gatsby-theme-material-ui";
import { Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow, useTheme } from "@material-ui/core";

import Suspense from "./ui/Suspense"
const CodeBlock = lazy(() => import('./CodeBlock'));
const RandomGenerator = lazy(() => import("./RandomGenerator"))
const DeviceSpecificationList = lazy(() => import("./DeviceSpecificationList"))
const TraceList = lazy(() => import("./TraceList"));
const SpecificationUnitList = lazy(() => import("./SpecificationUnitList"));
const StatusLEDAnimation = lazy(() => import("./StatusLEDAnimation"));

export default function useMdxComponents() {
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mdxComponents: any = useMemo(() => ({
    Link: props => <Link color="textPrimary" {...props} />,
    a: (props: { href: string }) => <Link color="textPrimary" {...props} rel="noopener noreferrer" />,
    pre: props => <Box mb={theme.spacing(0.5)}><Paper>
      <div {...props} />
    </Paper></Box>,
    table: props => <Box mb={theme.spacing(0.5)}><TableContainer component={Paper}>
      <Box m={theme.spacing(0.5)}>
        <Table size="small" {...props} />
      </Box>
    </TableContainer></Box>,
    thead: props => <TableHead {...props} />,
    tbody: props => <TableBody {...props} />,
    tr: props => <TableRow {...props} />,

    code: props => <Suspense><CodeBlock {...props} /></Suspense>,
    RandomGenerator: props => <Suspense><Box displayPrint="none"><RandomGenerator {...props} /></Box></Suspense>,
    DeviceSpecificationList: props => <Suspense><DeviceSpecificationList {...props} /></Suspense>,
    TraceList: props => <Suspense><TraceList {...props} /></Suspense>,
    SpecificationUnitList: props => <Suspense><SpecificationUnitList {...props} /></Suspense>,
    StatusLEDAnimation: props => <Suspense><StatusLEDAnimation {...props} /></Suspense>,
  }), []);

  return mdxComponents;
}