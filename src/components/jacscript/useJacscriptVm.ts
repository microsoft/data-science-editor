import { useEffect } from "react"
import useJacscript from "./JacscriptContext"

export default function useJacscriptVm() {
    const { acquireVm } = useJacscript()
    useEffect(() => acquireVm(), [])
}
