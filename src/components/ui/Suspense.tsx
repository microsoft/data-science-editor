import { NoSsr } from "@material-ui/core";
import React, { ReactNode, Suspense as ReactSuspense } from "react";
import LoadingProgress from "./LoadingProgress";

export default function Suspense(props: { children: ReactNode, fallback?: ReactNode, hideFallback?: boolean }) {
    const { children, fallback, hideFallback } = props;
    return <NoSsr>
        <ReactSuspense fallback={hideFallback ? undefined : fallback || <LoadingProgress />}>
            {children}
        </ReactSuspense>
    </NoSsr>
}