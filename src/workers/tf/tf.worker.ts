/* eslint-disable @typescript-eslint/ban-types */
import {
    io,
    layers,
    loadLayersModel,
    oneHot,
    sequential,
    tensor1d,
    tensor3d,
    Tensor,
    tensor,
} from "@tensorflow/tfjs"

export interface TFModelObj {
    name: string
    inputShape: number[]
    inputTypes: string[]
    labels: string[]
    modelJSON: string
    outputShape: number
    status: string
    trainingAcc: number
    weights: number[]
}

export interface TFModelMessage {
    worker: "tf"
    id?: string
    data?: any
}

export interface TFModelRequest extends TFModelMessage {
    type?: string
}

export interface TFModelTrainRequest extends TFModelRequest {
    type: "train"
    data: {
        modelBlockJSON: string
        model: TFModelObj
        xData: number[]
        yData: number[]
    }
}

export interface TFModelTrainResponse extends TFModelMessage {
    type: "train"
    data: {
        modelJSON: string
        modelWeights: ArrayBuffer
        trainingInfo: number[]
    }
}

export interface TFModelPredictRequest extends TFModelRequest {
    type: "predict"
    data: {
        model: TFModelObj
        zData: number[][]
    }
}

export interface TFModelPredictResponse extends TFModelMessage {
    type: "train"
    data: {
        prediction: number[]
    }
}

// send an object with model as blockly JSON
function buildModelFromJSON(model: TFModelObj, modelBlockJSON: string) {
    const modelLayers = sequential()
    const epochs = 250

    if (modelBlockJSON == "") {
        modelLayers.add(
            layers.conv1d({
                inputShape: model.inputShape,
                kernelSize: [4],
                strides: 1,
                filters: 16,
                activation: "relu",
            })
        )
        modelLayers.add(
            layers.maxPooling1d({
                poolSize: [2],
            })
        )
        modelLayers.add(
            layers.dropout({
                rate: 0.1,
            })
        )
        modelLayers.add(
            layers.conv1d({
                kernelSize: [2],
                strides: 1,
                filters: 16,
                activation: "relu",
            })
        )
        modelLayers.add(
            layers.maxPooling1d({
                poolSize: [2],
            })
        )
        modelLayers.add(
            layers.dropout({
                rate: 0.1,
            })
        )
        modelLayers.add(
            layers.conv1d({
                kernelSize: [2],
                strides: 1,
                filters: 16,
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
                units: model.outputShape,
                activation: "softmax",
            })
        )

        modelLayers.compile({
            loss: "categoricalCrossentropy",
            optimizer: "adam",
            metrics: ["accuracy"],
        })
    }

    return { model: modelLayers, epochs: epochs }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: { [index: string]: (props: any) => Promise<any> } = {
    train: async (props: TFModelTrainRequest) => {
        const { data } = props
        let trainingInfo = []

        // get dataset and training info
        const xs = tensor3d(data.xData, [
            data.xData.length,
            data.model.inputShape[0],
            data.model.inputShape[1],
        ])
        const ys = oneHot(
            tensor1d(data.yData, "int32"),
            data.model.labels.length
        )

        // get model
        const { epochs, model } = buildModelFromJSON(
            data.model,
            data.modelBlockJSON
        )

        // model.fit
        await model
            .fit(xs, ys, {
                epochs: epochs,
                callbacks: {
                    onEpochEnd, // onTrainBegin, onTrainEnd, onEpochBegin, onEpochEnd, onBatchBegin
                },
            })
            .then(info => {
                trainingInfo = info.history.acc
            })

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
        const weights = mod.weightData
        mod.weightData = null

        // return data
        const responseMsg = {
            modelJSON: JSON.stringify(mod),
            modelWeights: weights,
            trainingInfo: trainingInfo,
        }
        return responseMsg
    },
    predict: async (props: TFModelPredictRequest) => {
        const { data } = props

        // turn datasetjson into dataset
        /// get dataset and training info
        const zs = tensor(data.zData)

        // get model
        const modelObj = JSON.parse(data.model.modelJSON)
        modelObj.weightData = new Uint32Array(data.model.weights).buffer
        //modelObj.weightData = new Uint32Array(weightObj).buffer
        const model = await loadLayersModel({
            load: () => Promise.resolve(modelObj),
        })

        // model.predict
        const prediction = (await model.predict(zs)) as Tensor
        const predictArr = await prediction.dataSync()

        // return prediction
        return { prediction: predictArr }
    },
}

async function dispatchAsyncMessages(message: TFModelRequest) {
    try {
        const handler = handlers[message.type]
        return await handler?.(message)
    } catch (e) {
        console.error(e)
        return undefined
    }
}

async function handleMessage(event: MessageEvent) {
    const message: TFModelRequest = event.data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worker, ...rest } = message
    if (worker !== "tf") return

    const result = await dispatchAsyncMessages(message)

    const resp = { worker, ...rest, data: result }
    self.postMessage(resp)
}

function onEpochEnd(epoch, logs) {
    self.postMessage({ type: "progress", data: logs })
}

self.addEventListener("message", handleMessage)
console.debug(`jacdac tf: worker registered`)
