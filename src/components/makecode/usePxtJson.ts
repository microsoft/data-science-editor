import { useFetchJSON } from "../github"

export interface PxtJson {
    name: string
    description: string
    version?: string
    dependencies?: Record<string, string>
}

export default function usePxtJson(slug: string, branch?: string) {
    const { response: pxtJson } = useFetchJSON<PxtJson>(
        slug,
        branch || "master",
        "pxt.json",
        "application/json"
    )
    return pxtJson
}
