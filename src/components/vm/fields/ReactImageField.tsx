import { ReactField } from "./ReactField"
import Blockly from "blockly"
import { child } from "../../widgets/svg"

export default class ReactImageField<T> extends ReactField<T> {
    private img: SVGImageElement

    constructor(value: string, width = 32, height = 32) {
        super(value)

        this.size_ = new Blockly.utils.Size(width, height)
    }

    setSize(width: number, height: number) {
        this.size_ = new Blockly.utils.Size(width, height)
        if (this.img) {
            this.img.setAttribute("width", width + "")
            this.img.setAttribute("height", height + "")
        }
    }

    updateImage() {
        const imgUri = this.renderValue()
        if (imgUri) {
            this.img?.setAttributeNS(
                "http://www.w3.org/1999/xlink",
                "xlink:href",
                imgUri
            )
            this.img?.setAttribute("alt", this.getText())
        }
    }

    /**
     * Renders the value to a data uri string
     */
    renderValue(): string {
        return undefined
    }

    initView() {
        const { width, height } = this.size_
        this.img = child(this.fieldGroup_, "image", {
            height,
            width,
            alt: this.getText(),
        }) as SVGImageElement
        this.updateImage()
    }

    doValueUpdate_(newValue: string) {
        this.value_ = newValue
        this.updateImage()
    }

    updateSize_() {}
}
