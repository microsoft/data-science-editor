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

export function validDataSetJSON(blockJSON) {
    const warnings = {}
    const classNames = []

    // don't check empty block JSON
    if (!blockJSON) return undefined

    // 1. make sure there is at least one recording
    const firstLayer = blockJSON.inputs.filter(
        input => input.name == "LAYER_INPUTS"
    )[0].child
    if (!firstLayer) {
        warnings[blockJSON.id] =
            "Valid datasets should contain recording blocks"
        return warnings
    }

    // the first recording block determines the input type
    const inputTypes =
        firstLayer.inputs[0].fields.expand_button.value.inputTypes
    classNames.push(firstLayer.inputs[0].fields.class_name.value)
    firstLayer.children?.forEach(childBlock => {
        // 2. make sure subsequent recordings have the same input type as the first recording
        const recordingInputTypes =
            childBlock.inputs[0].fields.expand_button.value.inputTypes
        if (!arraysEqual(recordingInputTypes, inputTypes)) {
            warnings[childBlock.id] =
                "Recording does not match dataset input type"
        }

        const className = childBlock.inputs[0].fields.class_name.value
        if (classNames.indexOf(className) < 0) classNames.push(className)
    })

    // 3. make sure there are at least two classes in the dataset
    if (classNames.length < 2)
        warnings[blockJSON.id] =
            "Valid datasets should contain at least two different class labels"

    return warnings
}

export default class MBDataSet extends JDEventSource {
    static createFromFile(name: string, datasetJSONObj: DataSet): MBDataSet {
        const set = new MBDataSet(name)
        const { recordings, registerIds } = datasetJSONObj
        set.addRecordingsFromFile(recordings, registerIds) // add recordings and update total recordings
        return set
    }

    // maintain computed number of recordings and input data types to avoid recomputation
    totalRecordings: number
    interval: number

    // save what registers this dataset was created with
    registerIds: string[]

    // maintain data computed as arrays for tensorflow
    xs: number[][][]
    ys: number[]
    length: number
    width: number

    constructor(
        public name: string,
        public labels?: string[],
        public recordings?: { [label: string]: FieldDataSet[] },
        public inputTypes?: string[]
    ) {
        super()

        this.name = name
        this.labels = labels || []
        this.recordings = recordings || {}
        this.totalRecordings = this.countTotalRecordings()
        this.inputTypes = inputTypes || []
    }

    get labelOptions() {
        if (this.labels.length == 0) return ["class1"]
        return this.labels
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
            // the first recording added to the dataset determines its parameters
            this.labels.push(label)
            this.recordings[label] = [recording]
            this.inputTypes = recording.headers
            this.interval = recording.interval
            this.registerIds = registerIds

            this.totalRecordings += 1
            this.emit(CHANGE)
        } else if (arraysEqual(recording.headers, this.inputTypes)) {
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
            console.error(
                `Cannot add data of type ${recording.headers} to dataset with types ${this.inputTypes}`
            )
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
        const recordingIntervalHeader = `Interval,${this.interval}`

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

        const csv: string[] = [
            recordingCountHeader,
            recordingIntervalHeader,
            recordData,
        ]
        return csv.join("\n")
    }

    toJSON() {
        const datasetObj = {
            recordings: this.recordings,
            reigsterIds: this.registerIds,
            name: this.name,
        }
        return datasetObj
    }
}
