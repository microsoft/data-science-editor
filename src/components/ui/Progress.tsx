import { useEffect } from "react"
import useProgress from "./useProgress"

const PROGRESS_DELAY = 200

export default function Progress(props: {
    delay?: number
    children: JSX.Element
}) {
    const { delay, children } = props
    const { start, done } = useProgress()
    useEffect(() => {
        let id = setTimeout(() => {
            id = undefined
            start()
        }, delay || PROGRESS_DELAY)
        return () => {
            if (id) clearTimeout(id)
            else done()
        }
    }, [delay])
    return children
}
