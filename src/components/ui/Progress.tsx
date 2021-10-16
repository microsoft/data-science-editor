import { useEffect } from "react"
import { start, done } from "nprogress"

const PROGRESS_DELAY = 200

export default function Progress(props: {
    delay?: number
    children: JSX.Element
}) {
    const { delay, children } = props
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
