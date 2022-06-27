import { rawUrl } from "../github"
import useFetch from "../useFetch"

export interface PxtJson {
    name: string
    description: string
    version?: string
    dependencies?: Record<string, string>
}

export default function usePxtJson(slug: string, branch?: string) {
    if (!slug)
        return undefined
    const url = rawUrl(slug, branch, "pxt.json")
    const { response: pxtJson } = useFetch<PxtJson>(url)
    return pxtJson
}
