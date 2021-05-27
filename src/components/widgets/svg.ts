/* eslint-disable @typescript-eslint/no-explicit-any */
function mkTitle(txt: string): SVGTitleElement {
    const t = <SVGTitleElement>elt("title")
    t.textContent = txt
    return t
}
export function title(el: SVGElement, txt: string): SVGTitleElement {
    const t = mkTitle(txt)
    el.appendChild(t)
    return t
}

export function hydrate(el: SVGElement, props: any) {
    for (const k in props) {
        if (k == "title") {
            title(el, props[k])
        } else el.setAttributeNS(null, k, props[k])
    }
}

export function elt(name: string, props?: any): SVGElement {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name)
    if (props) hydrate(el, props)
    return el
}

export function child(parent: Element, name: string, props?: any): SVGElement {
    const el = elt(name, props)
    parent.appendChild(el)
    return el
}
