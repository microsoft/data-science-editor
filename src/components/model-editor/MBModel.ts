import { JDEventSource } from "../../../jacdac-ts/src/jdom/eventsource"
import type {
    TFModelTrainingParams,
    TFLayerStats,
} from "../../workers/tf/dist/node_modules/tf.worker"

export interface ModelStats {
    total: TFLayerStats
    layers: TFLayerStats[]
}

export const DEFAULT_MODEL = "default"
export const MCU_SPEED = 64000 // for microbit in 1/ms
export const MCU_FLOAT_SIZE = 2

export function validModelJSON(blockJSON) {
    const warnings = {}

    // don't check empty block JSON
    if (!blockJSON) return undefined

    // don't check default models
    if (blockJSON == DEFAULT_MODEL) return warnings

    // 1. make sure all of the training parameters are present
    const blockParams = blockJSON.inputs[1].fields.expand_button.value
    if (
        !blockParams.lossFn ||
        !blockParams.optimizer ||
        !blockParams.metrics ||
        !blockParams.numEpochs
    ) {
        warnings[blockJSON.id] =
            "Missing training parameters. Expand the block to enter parameters"
    }

    // 2. make sure there is at least one layer
    const firstLayer = blockJSON.inputs.filter(
        input => input.name == "LAYER_INPUTS"
    )[0].child
    if (!firstLayer) {
        warnings[blockJSON.id] = "Cannot train empty model"
        return warnings
    }

    // 3. make sure layer arch starts with a conv, pool, or flatten
    let convolutionType
    if (
        firstLayer.type == "model_block_conv1d_layer" ||
        firstLayer.type == "model_block_maxpool1d_layer"
        //layerBlock.type == "model_block_avgpool1d_layer"
    ) {
        convolutionType = "1d"
    } else if (
        firstLayer.type == "model_block_conv2d_layer" ||
        firstLayer.type == "model_block_maxpool2d_layer"
        //layerBlock.type == "model_block_avgpool2d_layer"
    ) {
        convolutionType = "2d"
    } else if (firstLayer.type != "model_block_flatten_layer") {
        warnings[firstLayer.id] =
            "Models must start with a convolutional layer, pooling layer, or flatten layer."
    }

    // 4. make sure a flatten layer is present
    let foundFlatten = firstLayer.type == "model_block_flatten_layer"

    // 5. the smallest possible model is a flatten layer plus a dense layer
    let minimumModel = false

    firstLayer.children?.forEach((childBlock, idx) => {
        if (!minimumModel) minimumModel = true
        // 6. make sure that only dense layers come after flatten
        if (foundFlatten) {
            if (
                childBlock.type != "model_block_dense_layer" &&
                childBlock.type != "model_block_dropout_layer"
            )
                warnings[childBlock.id] =
                    "Only dense and dropout layers can go after the flatten layer"
        }
        if (!foundFlatten)
            foundFlatten = childBlock.type == "model_block_flatten_layer"

        // 7. make sure 1d/2d model types are consistent
        if (convolutionType == "1d" && childBlock.type.indexOf("2d") > -1)
            warnings[childBlock.id] = `All layers in this model must be 1d`
        else if (convolutionType == "2d" && childBlock.type.indexOf("1d") > -1)
            warnings[childBlock.id] = `All layers in this model must be 2d`

        // 8. check that the last layer is a dense layer
        if (idx == firstLayer.children.length - 1) {
            if (childBlock.type != "model_block_dense_layer") {
                warnings[childBlock.id] =
                    "Last layer in model must be a dense layer"
            } else {
                // dense layer must have units equal to output shape & a softmax activation
                const params = childBlock.inputs[0].fields.expand_button.value

                // 9. final dense layer must have a softmax activation
                if (params.activation != "softmax")
                    warnings[
                        childBlock.id
                    ] = `The final dense layer must use "softmax" as activation function`

                // 10. final dense layer must have num units equal to the number of labels
                /*if (params.numUnits != outputShape)
                    warnings[
                        childBlock.id
                    ] = `The final dense layer must have a number of units equal to the output shape`*/
            }
        }
    })

    if (!minimumModel) {
        warnings[blockJSON.id] =
            "Models must contain one flatten layer that is followed by at least one dense layer"
    }
    if (!foundFlatten) {
        warnings[blockJSON.id] =
            "Models must contain at least one flatten layer"
    }

    return warnings
}

export default class MBModel extends JDEventSource {
    // maintain info about the dataset this model was created for
    inputShape: number[]
    inputTypes: string[]
    inputInterval: number
    outputShape: number

    // maintain training info about the model
    armModel: string
    trainingAcc: number
    modelStats: ModelStats
    modelSummary: string[]
    weightData: ArrayBuffer
    trainingParams: TFModelTrainingParams

    // maintain the blockJSON that goes with this model
    blockJSON: any
    layerJSON: any[]
    convolutionType: string

    static createFromFile(modelObj: {
        name: string
        inputShape: number[]
        inputTypes: string[]
        inputInterval: number
        convolutionType: string
        labels: string[]
        modelJSON: any
        modelStats: any
        outputShape: number
        status?: string
        trainingAcc?: number
        weights?: number[]
    }) {
        const mbModel = new MBModel(
            modelObj.name,
            modelObj.labels,
            modelObj.modelJSON,
            modelObj.status
        )
        mbModel.inputShape = modelObj.inputShape
        mbModel.inputTypes = modelObj.inputTypes
        mbModel.inputInterval = modelObj.inputInterval || 100
        mbModel.outputShape = modelObj.outputShape
        mbModel.convolutionType = modelObj.convolutionType

        mbModel.trainingAcc = modelObj.trainingAcc || 0
        mbModel.weightData =
            new Uint32Array(modelObj.weights).buffer || new ArrayBuffer(0)
        mbModel.modelStats = modelObj.modelStats || undefined

        return mbModel
    }

    constructor(
        public name: string,
        public labels?: string[],
        public modelJSON?: any,
        public status?: string
    ) {
        super()

        this.labels = this.labels || []
        this.modelJSON = this.modelJSON || ""
        this.status = this.status || "empty"

        this.weightData = new ArrayBuffer(0)
    }

    get summary() {
        const modelInfo = [
            `Training Status: ${this.status}`,
            `Input Types: ${this.inputTypes}`,
        ]
        if (this.modelStats)
            modelInfo.push(`Model Stats: ${this.modelStatSummary}`)

        return modelInfo
    }

    get modelStatSummary() {
        if (!this.modelStats || !this.modelStats.layers.length) return ""

        const totalBytes =
            this.modelStats.total.weightBytes + this.modelStats.total.codeBytes
        const totalCycles = this.modelStats.total.optimizedCycles
        const executionTimeMs = totalCycles / MCU_SPEED
        return `${this.modelStats.layers.length} layers, ${(
            totalBytes / 1000
        ).toPrecision(2)} KB, ${executionTimeMs.toPrecision(2)}ms`
    }

    set parseBlockJSON(blockJSON: any) {
        this.blockJSON = blockJSON

        const layers = []

        // get the first layer and add it to the list
        const layerBlock = blockJSON.inputs.filter(
            input => input.name == "LAYER_INPUTS"
        )[0].child

        if (layerBlock) {
            layers.push(layerBlock)

            // determine what dimensionality of CNN is used (1d, 2d, or none)
            this.convolutionType = ""
            if (layerBlock.type.indexOf("1d") > -1) this.convolutionType = "1d"
            if (layerBlock.type.indexOf("2d") > -1) this.convolutionType = "2d"

            // add the remaining layers to the list
            layerBlock.children?.forEach(childBlock => layers.push(childBlock))
        }

        // store layers with model
        this.layerJSON = layers
    }

    toJSON() {
        return {
            name: this.name,
            inputShape: this.inputShape,
            inputTypes: this.inputTypes,
            inputInterval: this.inputInterval,
            convolutionType: this.convolutionType,
            labels: this.labels,
            modelJSON: this.modelJSON,
            modelStats: this.modelStats,
            outputShape: this.outputShape,
            status: this.status || "empty",
            trainingAcc: this.trainingAcc || 0,
            weights: Array.from(new Uint32Array(this.weightData)),
        }
    }
}
