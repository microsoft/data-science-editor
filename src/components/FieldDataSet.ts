import JDBus from "../../jacdac-ts/src/jdom/bus"
import { CHANGE } from "../../jacdac-ts/src/jdom/constants"
import JDEventSource from "../../jacdac-ts/src/jdom/eventsource"
import JDField from "../../jacdac-ts/src/jdom/field"
import JDRegister from "../../jacdac-ts/src/jdom/register"
import {
    arrayConcatMany,
    roundWithPrecision,
} from "../../jacdac-ts/src/jdom/utils"

export class Example {
    label: string
    constructor(
        public readonly timestamp: number,
        public readonly data: number[]
    ) {}

    toVector(startTimestamp?: number): number[] {
        const t = this.timestamp - (startTimestamp || 0)
        const s = roundWithPrecision(t / 1000, 3)
        return [s].concat(this.data)
    }
}

export class Recording {
    constructor(
        public readonly name: string,
        public readonly colors: string[],
        public readonly headers: string[],
        public readonly rows: Example[],
        public readonly units: string[]
    ) {}
}

export default class FielddataSet extends JDEventSource {
    readonly id = Math.random().toString()
    readonly rows: Example[]
    headers: string[]
    units: string[]
    maxRows = -1

    // maintain computed min/max to avoid recomputation
    mins: number[]
    maxs: number[]

    static create(
        bus: JDBus,
        registers: JDRegister[],
        name: string,
        palette: string[],
        maxRows?: number
    ): FielddataSet {
        const fields = arrayConcatMany(registers.map(reg => reg.fields))
        const colors = fields.map((f, i) => palette[i % palette.length])
        const set = new FielddataSet(bus, name, fields, colors)
        if (maxRows !== undefined) set.maxRows = maxRows
        return set
    }

    static createFromFile(dataSet: {
        name: string
        rows: Example[]
        headers: string[]
        units: string[]
        colors?: string[]
    }): FielddataSet {
        const set = new FielddataSet(null, dataSet.name, null, dataSet.colors)

        dataSet.rows.forEach(row => {
            const { timestamp, data } = row
            set.addExample(timestamp, data)
        })
        set.units = dataSet.units
        set.headers = dataSet.headers
        set.colors = dataSet.colors

        return set
    }

    constructor(
        public readonly bus: JDBus,
        public readonly name: string,
        public readonly fields?: JDField[],
        public colors: string[] = ["#000"]
    ) {
        super()
        this.rows = []
        if (fields !== undefined && fields !== null) {
            this.headers = fields.map(field => field.name)
            this.units = fields.map(field => field.unit)
        }
    }

    get startTimestamp() {
        const row = this.rows[0]
        return row?.timestamp
    }

    get duration() {
        const first = this.rows[0]
        const last = this.rows[this.rows.length - 1]
        return (first && last && last.timestamp - first.timestamp) || 0
    }

    get length() {
        return this.rows.length
    }

    get width() {
        return this.headers.length
    }

    get headerList() {
        return this.headers
    }

    data(flatten?: boolean) {
        if (flatten && this.headers.length == 1)
            return this.rows.map(row => row.data[0])
        else return this.rows.map(row => row.data)
    }

    indexOf(field: JDField) {
        return this.fields.indexOf(field)
    }

    colorOf(field?: JDField, header?: string) {
        if (field) return this.colors[this.indexOf(field)]
        if (header) return this.colors[this.headers.indexOf(header)]
        return ["#000"]
    }

    addRow(data?: number[]) {
        const timestamp = this.bus.timestamp
        if (!data) data = this.fields.map(f => f.value)
        this.addExample(timestamp, data)
    }

    addData(data: number[]) {
        this.addExample(Date.now(), data)
    }

    private addExample(timestamp: number, data: number[]) {
        this.rows.push(new Example(timestamp, data))

        // drop rows if needed
        let refreshminmax = false
        while (this.maxRows > 0 && this.rows.length > this.maxRows * 1.1) {
            const d = this.rows.shift()
            refreshminmax = true
        }

        if (refreshminmax) {
            // refresh entire mins/max
            for (let r = 0; r < this.rows.length; ++r) {
                const row = this.rows[r]
                if (r == 0) {
                    this.mins = row.data.slice(0)
                    this.maxs = row.data.slice(0)
                } else {
                    for (let i = 0; i < row.data.length; ++i) {
                        this.mins[i] = Math.min(this.mins[i], row.data[i])
                        this.maxs[i] = Math.max(this.maxs[i], row.data[i])
                    }
                }
            }
        } else {
            // incremental update
            if (!this.mins) {
                this.mins = data.slice(0)
                this.maxs = data.slice(0)
            } else {
                for (let i = 0; i < data.length; ++i) {
                    this.mins[i] = Math.min(this.mins[i], data[i])
                    this.maxs[i] = Math.max(this.maxs[i], data[i])
                }
            }
        }

        this.emit(CHANGE)
    }

    toCSV(sep = ",", options?: { units?: boolean }) {
        const allheaders = ["time", ...this.headers].join(sep)
        const start = this.startTimestamp
        const csv: string[] = [allheaders]
        if (options?.units) csv.push(["s", ...this.units].join(sep))
        this.rows.forEach(row =>
            csv.push(
                row
                    .toVector(start)
                    .map(cell => (cell !== undefined ? cell.toString() : ""))
                    .join(sep)
            )
        )
        return csv.join("\n")
    }

    toJSON() {
        return {
            name: this.name,
            rows: this.rows,
            headers: this.headers,
            units: this.units,
            colors: this.colors,
        }
    }
}
