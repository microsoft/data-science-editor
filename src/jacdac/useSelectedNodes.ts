import { useRef, useState } from "react"
import { JDNode } from "../../jacdac-ts/src/jdom/node"

export default function useSelectedNodes<TNode extends JDNode>(
    singleSelection?: boolean
) {
    const nodes = useRef<Set<string>>(new Set<string>())
    const [change, setChange] = useState(0)

    const selected = (node: TNode) => nodes.current.has(node?.id)
    const setSelected = (node: TNode, value: boolean) => {
        if (!node) return
        const s = selected(node)
        if (!!value !== s) {
            if (!value) nodes.current.delete(node.id)
            else {
                if (singleSelection) nodes.current.clear()
                nodes.current.add(node.id)
            }
            setChange(change + 1)
        }
    }
    return {
        hasSelection: nodes.current.size > 0,
        selected,
        setSelected,
        toggleSelected: (node: TNode) => {
            setSelected(node, !selected(node))
        },
        clear: () => {
            nodes.current.clear()
            setChange(0)
        },
    }
}
