import { NoSsr } from "@material-ui/core";
import React, { ReactNode, Suspense as ReactSuspense, useEffect } from "react";
import { start, done } from "nprogress"

function Fallback() {
    useEffect(() => {
        start();
        return () => done();
    }, []);
    return <span></span>
}

export default function Suspense(props: { children: ReactNode }) {
    const { children } = props;
    return <NoSsr>
        <ReactSuspense fallback={<Fallback />}>
            {children}
        </ReactSuspense>
    </NoSsr>
}