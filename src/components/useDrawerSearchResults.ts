import { useContext, useRef } from "react"
import { useDebounce } from "use-debounce"
import AppContext from "./AppContext"
import useSearchIndex from "./useSearchIndex"

export interface SearchResult {
    url: string
    title: string
}

export function useDrawerSearchResults(): SearchResult[] {
    const index = useSearchIndex()

    const { searchQuery: _searchQuery } = useContext(AppContext)
    const [searchQuery] = useDebounce(_searchQuery, 500)
    // debounce duplicate search
    const lastResult = useRef<{ searchQuery: string; nodes: SearchResult[] }>(
        undefined
    )
    if (lastResult.current?.searchQuery === searchQuery)
        return lastResult.current.nodes

    // spin up search
    //console.debug(`search "${searchQuery}"`)
    let nodes: SearchResult[] = undefined
    if (searchQuery && index) {
        const results = index.search(searchQuery, <any>{
            expand: true,
        })
        const indexDocs = results.map(({ ref }) =>
            index.documentStore.getDoc(ref)
        )
        nodes = indexDocs.map(
            id =>
                <SearchResult>{
                    title: id.title,
                    url: id.url,
                }
        )
    }

    // cache result
    lastResult.current = {
        searchQuery,
        nodes,
    }
    return nodes
}
