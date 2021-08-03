import ReactField from "./ReactField"
import { child } from "../../widgets/svg"
import { utils } from "blockly"

export default class ReactImageField<T> extends ReactField<T> {
    constructor(value: string, width = 32, height = 32) {
        super(value, undefined, undefined, { width, height })
    }

    setSize(width: number, height: number) {
        this.size_ = new utils.Size(width, height)
        const img = this.view as SVGImageElement
        if (img) {
            img.setAttribute("width", width + "")
            img.setAttribute("height", height + "")
        }
    }

    protected updateView() {
        const imgUri = this.renderValue()
        const img = this.view as SVGImageElement
        if (imgUri) {
            img?.setAttributeNS(
                "http://www.w3.org/1999/xlink",
                "xlink:href",
                imgUri
            )
            img?.setAttribute("alt", this.getText())
        }
    }

    /**
     * Renders the value to a data uri string
     */
    protected renderValue(): string {
        return undefined
    }

    protected initCustomView() {
        const { width, height } = this.size_
        return child(this.fieldGroup_, "image", {
            height,
            width,
            alt: this.getText(),
        }) as SVGImageElement
    }
}
