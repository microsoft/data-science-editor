import { NoSsr } from "@material-ui/core";
import React, { ReactNode, Suspense as ReactSuspense } from "react";
import LoadingProgress from "./LoadingProgress";

export default function Suspense(props: { children: ReactNode, fallback?: ReactNode }) {
    const { children, fallback } = props;
    return <NoSsr>
        <ReactSuspense fallback={fallback || <LoadingProgress />}>
            {children}
        </ReactSuspense>
    </NoSsr>
}