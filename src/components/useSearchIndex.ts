import { graphql, useStaticQuery } from "gatsby"
import { Index } from "elasticlunr"
import { useRef } from "react"

export default function useSearchIndex() {
    const { siteSearchIndex } = useStaticQuery(graphql`
        query SearchIndexQuery {
            siteSearchIndex {
                index
            }
        }
    `)
    const index = useRef(Index.load(siteSearchIndex.index))
    return index.current
}
