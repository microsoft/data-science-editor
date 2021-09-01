/* eslint-disable @typescript-eslint/ban-types */
import {
    io,
    layers,
    loadLayersModel,
    oneHot,
    sequential,
    tensor1d,
    tensor3d,
    tensor,
} from "@tensorflow/tfjs"

import type { Tensor, Sequential } from "@tensorflow/tfjs"

import { compileAndTest, compileModel } from "../../../ml4f"
import type { LayerStats } from "../../../ml4f"

export type TFLayerStats = LayerStats

export interface TFModelObj {
    name: string
    inputShape: number[]
    inputTypes: string[]
    inputInterval: number
    convolutionType: string
    labels: string[]
    modelJSON: any
    outputShape: number
    status: string
    trainingAcc: number
    weights: number[]
}

export interface TFModelTrainingParams {
    loss: string
    optimizer: string
    metrics: string[]
    epochs: number
}

export interface TFModelMessage {
    worker: "tf"
    type?: string
    id?: string
    data?: any
}

export interface TFModelCompileRequest extends TFModelMessage {
    type: "compile"
    data: {
        modelBlockJSON: string
        model: TFModelObj
    }
}

export interface TFModelCompileResponse extends TFModelMessage {
    type: "compile"
    data: {
        modelJSON: any
        modelStats: TFLayerStats[]
        trainingParams: TFModelTrainingParams
    }
}

export interface TFModelTrainRequest extends TFModelMessage {
    type: "train"
    data: {
        trainingParams: TFModelTrainingParams
        model: TFModelObj
        xData: number[][][]
        yData: number[]
    }
}

export interface TFModelTrainResponse extends TFModelMessage {
    type: "train"
    data: {
        modelWeights: ArrayBuffer
        trainingLogs: number[]
        armModel: string
    }
}

export interface TFModelPredictRequest extends TFModelMessage {
    type: "predict"
    data: {
        model: TFModelObj
        zData: number[][][]
    }
}

export interface TFModelPredictResponse extends TFModelMessage {
    type: "predict"
    data: {
        predictTop: number[]
        predictAll: any
    }
}

function addLayer(layerObj: any, inputShape: number[], outputShape: number) {
    let layer
    const params = layerObj.inputs[0].fields.expand_button.value

    switch (layerObj.type) {
        case "model_block_conv1d_layer":
            if (inputShape) {
                layer = layers.conv1d({
                    inputShape: inputShape,
                    kernelSize: [params.kernelSize],
                    strides: params.strideSize,
                    filters: params.numFilters,
                    activation: params.activation,
                    padding: "same",
                })
            } else {
                layer = layers.conv1d({
                    kernelSize: [params.kernelSize],
                    strides: params.strideSize,
                    filters: params.numFilters,
                    activation: params.activation,
                    padding: "same",
                })
            }

            break
        case "model_block_maxpool1d_layer":
            if (inputShape) {
                layer = layers.maxPooling1d({
                    inputShape: inputShape,
                    poolSize: [params.poolSize],
                    padding: "same",
                })
            } else {
                layer = layers.maxPooling1d({
                    poolSize: [params.poolSize],
                    padding: "same",
                })
            }
            break
        case "model_block_avgpool1d_layer":
            /*if (inputShape) {
                layer = layers.avgPooling1d({
                    inputShape: inputShape,
                    poolSize: [params.poolSize],
            padding: "same",
                })
            } else {
                layer = layers.avgPooling1d({
                    poolSize: [params.poolSize],
            padding: "same",
                })
            }*/
            break
        case "model_block_conv2d_layer":
            if (inputShape) {
                layer = layers.conv2d({
                    inputShape: inputShape,
                    kernelSize: [params.kernelSize, params.kernelSize],
                    strides: params.strideSize,
                    filters: params.numFilters,
                    activation: params.activation,
                    padding: "same",
                })
            } else {
                layer = layers.conv2d({
                    kernelSize: [params.kernelSize, params.kernelSize],
                    strides: params.strideSize,
                    filters: params.numFilters,
                    activation: params.activation,
                    padding: "same",
                })
            }
            break
        case "model_block_maxpool2d_layer":
            if (inputShape) {
                layer = layers.maxPooling2d({
                    inputShape: inputShape,
                    poolSize: [params.poolSize, params.poolSize],
                    padding: "same",
                })
            } else {
                layer = layers.maxPooling2d({
                    poolSize: [params.poolSize, params.poolSize],
                    padding: "same",
                })
            }
            break
        case "model_block_avgpool2d_layer":
            /*if (inputShape) {
                    layer = layers.avgPooling2d({
                        inputShape: inputShape,
                        poolSize: [params.poolSize],
                padding: "same",
                    })
                } else {
                    layer = layers.avgPooling2d({
                        poolSize: [params.poolSize],
                padding: "same",
                    })
                }*/
            break
        case "model_block_dropout_layer":
            layer = layers.dropout({
                rate: params.rate,
            })
            break
        case "model_block_flatten_layer":
            if (inputShape) {
                layer = layers.flatten({
                    inputShape: inputShape,
                })
            } else layer = layers.flatten()
            break
        case "model_block_dense_layer":
            layer = layers.dense({
                units: outputShape || params.numUnits,
                activation: outputShape ? "softmax" : params.activation,
            })
            break
        default:
            console.error("Received an invalid layer type")
    }
    return layer
}

function buildDefaultModel(
    modelLayers: Sequential,
    inputShape: number[],
    outputShape: number
) {
    modelLayers.add(
        layers.conv2d({
            inputShape: inputShape,
            kernelSize: [4, 4],
            strides: 1,
            filters: 16,
            padding: "same",
            activation: "relu",
        })
    )
    modelLayers.add(
        layers.maxPooling2d({
            poolSize: [2, 2],
            padding: "same",
        })
    )
    modelLayers.add(
        layers.dropout({
            rate: 0.1,
        })
    )
    modelLayers.add(
        layers.conv2d({
            kernelSize: [2, 2],
            strides: 1,
            filters: 16,
            padding: "same",
            activation: "relu",
        })
    )
    modelLayers.add(
        layers.maxPooling2d({
            poolSize: [2, 2],
            padding: "same",
        })
    )
    modelLayers.add(
        layers.dropout({
            rate: 0.1,
        })
    )
    modelLayers.add(
        layers.conv2d({
            kernelSize: [2, 2],
            strides: 1,
            filters: 16,
            padding: "same",
            activation: "relu",
        })
    )
    modelLayers.add(
        layers.dropout({
            rate: 0.1,
        })
    )
    // moving from 3-dimensional data to 2-dimensional requires a flattening layer
    modelLayers.add(layers.flatten())
    // must end with a fully connected layer with size equal to number of labels
    modelLayers.add(
        layers.dense({
            units: outputShape,
            activation: "softmax",
        })
    )
}

// send an object with model as blockly JSON
function buildModelFromJSON(model: TFModelObj, block: any) {
    const modelLayers = sequential()

    // initialize training params
    let trainingParams

    if (block == "default") {
        // use input shape for 2d CNN
        model.inputShape.push(1)

        buildDefaultModel(modelLayers, model.inputShape, model.outputShape)
        trainingParams = {
            loss: "categoricalCrossentropy",
            optimizer: "adam",
            metrics: ["acc"],
            epochs: 250,
        }
    } else {
        // use appropriate input shape for 1d/2d CNN
        if (model.convolutionType == "2d") model.inputShape.push(1)

        // iterate through block layers for model architecture
        const layerBlock = block.inputs.filter(
            input => input.name == "LAYER_INPUTS"
        )[0].child
        let layer = addLayer(layerBlock, model.inputShape, null)
        modelLayers.add(layer)

        // subsequent blocks (if any) are children of the first block
        if (layerBlock) {
            layerBlock.children?.forEach((childBlock, idx) => {
                if (idx == layerBlock.children.length - 1) {
                    // last layer should be a dense layer with units equal to output shape
                    layer = addLayer(childBlock, null, model.outputShape)
                } else {
                    layer = addLayer(childBlock, null, null)
                }
                modelLayers.add(layer)
            })
        }

        // parameters for training model
        const blockParams = block.inputs[1].fields.expand_button.value
        trainingParams = {
            loss: blockParams.lossFn,
            optimizer: blockParams.optimizer,
            metrics: [blockParams.metrics],
            epochs: blockParams.numEpochs,
        }
    }

    return { model: modelLayers, params: trainingParams }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: {
    [index: string]: (props: TFModelMessage) => Promise<TFModelMessage>
} = {
    compile: async (props: TFModelCompileRequest) => {
        const { data } = props
        // get model
        const { model, params } = buildModelFromJSON(
            data.model,
            data.modelBlockJSON
        )

        // save model as model artifacts
        let mod: io.ModelArtifacts
        await model.save({
            save: m => {
                mod = m
                const res: io.SaveResult = {
                    modelArtifactsInfo: {
                        dateSaved: new Date(),
                        modelTopologyType: "JSON",
                    },
                }
                return Promise.resolve(res)
            },
        })
        mod.weightData = null

        // save compiled model stats
        let compiledModel
        try {
            compiledModel = await compileModel(model, {
                verbose: false,
                float16weights: true,
                optimize: true,
            })
        } catch (e) {
            console.error(
                "Error with getting model stats during compiling: ",
                e
            )
            return { ...props, data: undefined }
        }
        const stats = [...compiledModel.stats.layers, compiledModel.stats.total]

        // return data
        const result = {
            modelJSON: mod,
            modelStats: stats,
            trainingParams: params,
        }
        return { ...props, data: result }
    },
    train: async (props: TFModelTrainRequest) => {
        const { data } = props

        if (
            data.xData[0].length != data.model.inputShape[0] ||
            data.xData[0][0].length != data.model.inputShape[1]
        ) {
            console.error("Input data does not match expected shape of model.")
            return { ...props, data: undefined }
        }

        // get model
        data.model
        const modelObj = data.model.modelJSON
        const model = await loadLayersModel({
            load: () => Promise.resolve(modelObj),
        })

        // get dataset
        let xs = tensor3d(data.xData, [
            data.xData.length,
            data.model.inputShape[0],
            data.model.inputShape[1],
        ])

        const firstLayer = modelObj.modelTopology.config.layers[0]
        // expand input shape if working with 2d model arch
        if (firstLayer["class_name"].indexOf("2D") > -1) xs = xs.expandDims(3)

        const ys = oneHot(
            tensor1d(data.yData, "int32"),
            data.model.labels.length
        )

        // compile model
        const params = data.trainingParams
        try {
            model.compile({
                loss: params.loss,
                optimizer: params.optimizer,
                metrics: params.metrics,
            })
        } catch (e) {
            console.error("Error with model.compile during training: ", e)
            return { ...props, data: undefined }
        }

        // model.fit
        let trainingLogs = [] // space to save training loss and accuracy data
        try {
            await model
                .fit(xs, ys, {
                    epochs: params.epochs,
                    validationSplit: data.xData.length > 40 ? 0.1 : 0,
                    callbacks: {
                        onEpochEnd, // onTrainBegin, onTrainEnd, onEpochBegin, onEpochEnd, onBatchBegin
                    },
                })
                .then(info => {
                    trainingLogs = info.history.acc
                })
        } catch (e) {
            console.error("Error with model.fit during training: ", e)
            return { ...props, data: undefined }
        }

        // save model as model artifacts
        let mod: io.ModelArtifacts
        await model.save({
            save: m => {
                mod = m
                const res: io.SaveResult = {
                    modelArtifactsInfo: {
                        dateSaved: new Date(),
                        modelTopologyType: "JSON",
                    },
                }
                return Promise.resolve(res)
            },
        })
        // remove weight data from model artifacts and save separately
        //   it seems that model won't save correctly otherwise
        const weights = mod.weightData
        mod.weightData = null

        // compile arm model for mcu
        let armcompiled
        try {
            armcompiled = await compileAndTest(model, {
                verbose: false,
                includeTest: true,
                float16weights: true,
                optimize: true,
            })
        } catch (e) {
            console.error("Error compiling arm model during training: ", e)
        }

        // return data
        const result = {
            modelWeights: weights,
            trainingLogs: trainingLogs,
            armModel: JSON.stringify(armcompiled),
        }
        return { ...props, data: result }
    },
    predict: async (props: TFModelPredictRequest) => {
        const { data } = props

        // get model
        const modelObj = data.model.modelJSON
        // load weight data into model before loading the model
        modelObj.weightData = new Uint32Array(data.model.weights).buffer
        const model = await loadLayersModel({
            load: () => Promise.resolve(modelObj),
        })

        /// get dataset
        let zs = tensor(data.zData)
        const firstLayer = modelObj.modelTopology.config.layers[0]
        // expand input shape if working with 2d model arch
        if (firstLayer["class_name"].indexOf("2D") > -1) zs = zs.expandDims(3)

        // model.predict
        let predResult
        try {
            predResult = (await model.predict(zs)) as Tensor
        } catch (e) {
            console.error("Error with model.predict during prediction: ", e)
            return { ...props, data: undefined }
        }
        // make an array with the index of the top class
        const predictTop = await predResult.argMax(1).dataSync()

        // make an array with the confidence level for all of the classes
        const confidenceArr = await predResult.dataSync()
        const predictAll = []
        const numExamples = data.zData.length
        const numLabels = data.model.labels.length
        for (let i = 0; i < numExamples; i++) {
            const prediction = {}
            for (let j = 0; j < numLabels; j++) {
                prediction[data.model.labels[i * numLabels + j]] =
                    confidenceArr[i * numLabels + j]
            }
            predictAll.push(prediction)
        }

        // return prediction
        const result = { predictAll: predictAll, predictTop: predictTop }

        return { ...props, data: result }
    },
}

async function dispatchAsyncMessages(message: TFModelMessage) {
    try {
        const handler = handlers[message.type]
        return await handler?.(message)
    } catch (e) {
        console.error(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: TFModelMessage = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worker, ...rest } = message
    if (worker !== "tf") return

    const resp = await dispatchAsyncMessages(message)
    self.postMessage(resp)
}

function onEpochEnd(epoch, logs) {
    self.postMessage({ type: "progress", data: logs })
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac tf: worker registered`)
