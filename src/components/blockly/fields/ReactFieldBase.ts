import Blockly from "blockly"

export class ReactFieldBase<T> extends Blockly.Field {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(
        value: string,
        validator?: any,
        options?: any,
        size?: { width: number; height: number }
    ) {
        super(value, validator, options)
        if (size) this.size_ = new Blockly.utils.Size(size.width, size.height)
    }

    get defaultValue(): T {
        return {} as T
    }

    get value(): T {
        try {
            const v = JSON.parse(this.getValue())
            return (v || this.defaultValue) as T
        } catch (e) {
            console.warn(e)
            return this.defaultValue
        }
    }

    set value(v: T) {
        this.setValue(JSON.stringify(v))
    }
}