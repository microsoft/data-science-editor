import { NoSsr } from "@mui/material"
import React, {
    ReactNode,
    Suspense as ReactSuspense,
    useEffect,
    useState,
} from "react"
import Progress from "./Progress"

export default function Suspense(props: {
    children: ReactNode
    fallback?: React.ReactNode
}) {
    const { children, fallback } = props

    // HACK: react 18 bug, does not seem to refresh Suspense
    const [, setState] = useState(false)
    useEffect(() => {
        let mounted = true
        let retry = 0
        const check = () => {
            {
                retry++
                const status: number = (children as any).type?._payload?._status
                //console.log({ status, retry })
                if (!mounted || status === undefined || retry > 20) return
                else if (status >= 1) setState(() => true)
                else setTimeout(check, 200 + retry * 100)
            }
        }
        check()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <NoSsr>
            <ReactSuspense
                fallback={
                    fallback != undefined ? (
                        fallback
                    ) : (
                        <Progress>
                            <span></span>
                        </Progress>
                    )
                }
            >
                {children}
            </ReactSuspense>
        </NoSsr>
    )
}
