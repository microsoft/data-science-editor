import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"

import FieldDataSet, { Recording } from "../FieldDataSet"

export class DataSet {
    constructor(
        public readonly inputTypes: string[],
        public readonly recordings: { [label: string]: Recording[] },
        public readonly registerIds: string[],
        public readonly totalRecordings: number
    ) {}
}

export function arraysEqual(a: string[], b: string[]): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false
    }
    return true
}

export default class ModelDataSet extends JDEventSource {
    static createFromFile(datasetJSONObj: DataSet): ModelDataSet {
        const set = new ModelDataSet()
        const { recordings, registerIds } = datasetJSONObj
        set.addRecordingsFromFile(recordings, registerIds) // add recordings and update total recordings
        return set
    }

    // maintain computed number of recordings and input data types to avoid recomputation
    totalRecordings: number

    // maintain data in tensors
    xs: number[]
    ys: number[]
    length: number
    width: number

    constructor(
        public readonly labels?: string[],
        public readonly recordings?: { [label: string]: FieldDataSet[] },
        public inputTypes?: string[],
        public registerIds?: string[]
    ) {
        super()

        this.labels = []
        this.recordings = {}
        this.totalRecordings = 0
    }

    get labelOptions() {
        if (this.labels.length == 0) return ["class1"]
        return this.labels
    }

    get numRecordings() {
        return this.totalRecordings
    }

    getRecordingsWithLabel(label: string) {
        return this.recordings[label]
    }

    addRecording(
        recording: FieldDataSet,
        label: string,
        registerIds: string[]
    ) {
        if (this.totalRecordings == 0) {
            this.labels.push(label)
            this.recordings[label] = [recording]
            this.inputTypes = recording.headerList
            this.registerIds = registerIds

            this.totalRecordings += 1
            this.emit(CHANGE)
        } else if (arraysEqual(recording.headerList, this.inputTypes)) {
            // Check if label is already in dataset
            if (this.labels.indexOf(label) < 0) {
                // If not, add the new label to the dataset
                this.labels.push(label)
                this.recordings[label] = [recording]
            } else {
                this.recordings[label].push(recording)
            }

            this.totalRecordings += 1
            this.emit(CHANGE)
        } else {
            // Randi TODO decide what error to raise when inputting incorrect data (shouldn't be possible, though)
            console.log("Randi, did not add data to dataset")
        }
    }

    addRecordingsFromFile(
        recordings: { [label: string]: Recording[] },
        registerIds: string[]
    ) {
        //totalRecordings
        Object.keys(recordings).forEach(label => {
            recordings[label].forEach(recording => {
                const set = FieldDataSet.createFromFile(recording)
                this.addRecording(set, label, registerIds)
            })
        })
    }

    removeRecording(recording: FieldDataSet) {
        const recordingLabel = recording.name.slice(
            0,
            recording.name.indexOf("$")
        )
        const i = this.recordings[recordingLabel].indexOf(recording)

        if (i > -1) {
            this.recordings[recordingLabel].splice(i, 1)

            // If this emptied out a label, then remove that label
            if (this.recordings[recordingLabel].length == 0) {
                const j = this.labels.indexOf(recordingLabel)
                this.labels.splice(j, 1)
            }

            this.totalRecordings -= 1
        }
    }

    countTotalRecordings() {
        let total = 0

        this.labels.forEach(label => {
            this.recordings[label].forEach(() => {
                total += 1
            })
        })

        return total
    }

    get summary() {
        if (this.labels.length <= 0) return ["Classes: none"]

        const modelInfo = []
        const classes = []
        this.labels.forEach(label => {
            classes.push(
                label + " [" + this.recordings[label].length + " sample(s)]"
            )
        })
        modelInfo.push("Classes: " + classes.join(", "))

        return modelInfo
    }

    toCSV() {
        const recordingCountHeader = `Number of recordings,${this.totalRecordings}`

        const recordingData: string[] = []
        this.labels.forEach(label => {
            this.recordings[label].forEach(recording => {
                recordingData.push(
                    "Recording metadata," +
                        recording.name +
                        "," +
                        recording.rows.length +
                        "," +
                        label
                )
                recordingData.push(recording.toCSV())
            })
        })
        const recordData = recordingData.join("\n")

        const csv: string[] = [recordingCountHeader, recordData]
        return csv.join("\n")
    }
}
