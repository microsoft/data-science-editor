# ML Blocks Documentation

Last updated September 2021

## Major Sections

-   [ML Blocks Editor Page](#ml-blocks)
-   [ML Blocks Category for VM](#ml-vm)
-   [Model Editor Page](#model-editor)
-   [TensorflowJS web worker](#tf-worker)

## <a name="ml-blocks"></a> ML Blocks Editor Page

[https://microsoft.github.io/jacdac-docs/editors/ml]()
**Description**: This page contains a block-based interface for collecting data, training models, and testing models. It is a space for model developers to create new machine learning models on one graphical workspace. Models trained in the block editor can be imported into the [Makecode extension](https://github.com/microsoft/pxt-ml) or [VM blocks](microsoft.github.io/jacdac-docs/editors/vm/).

**Code outline**: The page is deploted from src/pages/editors/ml.tsx
_Workspace management_

-   **ModelBlockEditor** (src/components/model-editor/ModelBlockEditor.tsx) controls all of the major functions of the page. The code is roughly divided into the following parts:
    -   Data storage
        The only data that is stored are the recordings attached to blocks (see _allRecordings_ variable) and models that have been trained and are attached to trained model blocks (see _trainedModels_ variable).
    -   Compiling models and datasets. The _assembleDataSet_ function compiles stacks of recordings into a data set and places warnings on blocks. Warnings occur if the input types of a recording does not match the rest of the data set (see src/components/model-editor/MBDataSet.ts). The _assembleModel_ function compiles stacks of layer into a model architecture. It places warnings on a model if the model architecture is invalid (see src/components/model-editor/MBModel.ts).
    -   Dialog handling
        **ModelBlockDialogs** (src/components/dialogs/mb/ModelBlockDialogs.tsx) A significant chunk of programming in model blocks happens in dialogs these dialogs include:
        1. **RecordDataDialog** (src/components/dialogs/mb/RecordDataDialog.tsx)
        This dialog allows users to collect recordings. On the first page, they set the parameters for recordings (sensors, interval, duration, class label). On the second page they can record samples.
        2. **ViewDataDialog** (src/components/dialogs/mb/ViewDataDialog.tsx)
        This dialog allows users to see a compiled data set as mini Trend snapshots and in a data plot.
        3. **AddNewClassifierDialog** (src/components/dialogs/mb/AddNewClassifierDialog.tsx)
        This dialog allows the user to set the name of a new classifier variable and choose from a set of template model architectures to add to the workspace. 4. **TrainModelDialog** (src/components/dialogs/mb/TrainModelDialog.tsx)
        This dialog allows the user to train (or retrain) a model, view learning curves as the model trained, and then test the model on live data. 5. **TestModelDialog**
        (src/components/dialogs/mb/TestModelDialog.tsx)
        This dialog allows the user to test a trained model on live data.

_Block defintions_

-   **modelblockdsl.ts** (src/components/model-editor/modelblockdsl.ts)
    This file contains the defintion of the blocks. There are two kinds of blocks:
    1. Dataset blocks, including recording blocks and dataset blocks that group recordings together
    2. Model blocks, including the different kinds of layer blocks and the classifier blocks that group layer blocks together
-   **ExpandModelBlockField** (src/components/blocksl.fields/mb/ExpandModelBlockField.tsx)
    Almost all model blocks contain an expansion field, however [different blocks contain different information](#block-defs). This is handled by adding a removable field based on the source block's type.
    As soon as information is updated on removable fields, it is written to the ExpandModelBlockField.

_Block descriptions_
Data Set Blocks
| Name              | Parameters                                                                                                                                                                               | Information                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
Data set block | _User input:_ name for the data set (from variable dropdown). _Automatic:_ number of recordings, number of samples, list of classes, list of input types (button, sound_level, etc.) | Assemble stacks of recording blocks inside to make a data set. Blocks have a view and download button. The view button creates a dialog where you can see a grid of samples and a plot of data. The download button saves a CSV
Recording block | _User input:_ name for recording, class label for recording (from variable dropdown). _Automatic:_ Number of samples, list of input types, timestamp that recording was taken | Blocks are attached to arrays of Field Data Sets that store recording data. Expandable field holds a download button that will save recording to CSV

Model Blocks
| Name              | Parameters                                                                                                                                                                               | Information                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
Neural network classifier block | _User input:_ classifier name (from variable dropdown), training data set name (from variable dropdown), optimizer (adam, SGD, adadelta, or adagrad), loss function (categorical crossentropy, mean squared error, or hinge loss), number of epochs to train. _Automatic:_ model input shape, number of layers in model, nubmer of parameters in model, compiled model size, compiled model runtime | Assemble sequences (order matters) of layer blocks inside to form a model architecture. Blocks have a train and download button. The train button opens a dialog where users can train the model and see learning curves. The download button downloads the model as a CSV
Trained model block |_User input:_ trained model name, testing data (from variable dropdown), chart to display (either confusion matrix or data set plot)| This block is used to store a trained model and evaluate it with testing data sets. Blocks have a view button and a download button. The view button opens a dialog where users can live test the trained model. The download button downloads the model as JSON for importing into other tools.

Layer Blocks
Note: All layer blocks have the same automatic ally generated parameters

-   output shape of layer
-   percent of total model size
-   percent of total parameters in model
-   compiled run time of this layer

| Name              | Parameters                                                                                                                                                                               | Information                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Convolution 1d/2d | _User input:_ number of filters to use, kernel size (this value is used to create a square kernel for 2d blocks), stride size, activation function to use (relu, linear, or softmax). \* | Convolutional layers train filters that are passed across the data to detect key features. The 1d convolution considers each input channel separately, while the 2d convolution aggregates the input channels.     |
| Max pool 1d/2d    | _User input:_ pool size (this value is used to create a square pool for 2d blocks), stride size                                                                                          | Pooling layers summarize the features of its input to reduce the size of the feature maps. 1d pooling considers each input channel separately while 2d pooling aggregates the channels.                            |
| Dropout           | _User input:_ rate aka the number of nodes to drop (number between 0 and 1)                                                                                                              | Dropout layers drop a proportion of nodes from the previous layer, this helps neural networks generalize about which features contribute to each class                                                             |
| Flatten           |                                                                                                                                                                                          | Flatten layers reduce the dimensionality of nodes (convolutional, pooling, and dropout layers can all have more than one dimension depending on the number of input channels). This layer goes before dense layers |
| Dense             | _User input:_ number of nodes, activation function (relu, linear, or softmax)                                                                                                            | Dense layers are fully connected layers of nodes. The last layer should be a dense layer with a softmax activation function, since it is used to relate to the output layer.                                       |

**To-dos**:

-   ModelblockEditor - save recordings and trained models with project files along with blockly code, these should be loaded before ModelBlockEditor component is called
-   modelblockdsl & ModelBlockEditor - rewrite the code using Jacdac data services so that more information is located on the blocks
-   modelblockdsl & ExpandModelBlockField - properly define mutators so that you can move blocks when the expanded parameters are open
-   ModelBlockDialogs - create a new dialog to import data set from CSV file
-   ViewDataDialog - add a function to split a data set (i.e. withhold 20% of the data from each class and place it in a new dataset)
-   RecordDataDialog - allow longer recordings followed by data segmentation, this is a more natural way to record input data
-   TrainModelDialog - add ability to cancel training
-   TrainedModelBlock - use Vega Chart Widget (has full screen and copy button) in blocks

## <a name="ml-vm"></a> ML Blocks Category for VM

https://microsoft.github.io/jacdac-docs/editors/ml
**Description**: This category of blocks interfaces with the existing VM blocks (particularly those that stream data from sensors) to run inference using a trained model. Users can import a model from the [ML Blocks Editor](https://microsoft.github.io/jacdac-docs/editors/ml) or [Model Editor](https://microsoft.github.io/jacdac-docs/tools/model-editor) page to see live predictions.

**Code outline**:

-   **mlblocksdsl.ts**
    (src/components/blockly/dsl/mlblocksdsl.ts)
    -   "Import ML Model" button - once a directory is selected to save the VM workspace file, this button can be used to move a ML model JSON file into that directory
    -   "model_blocks_classifier" block is self-contained with the code needed to make the prediction occur
        -   transformData retrieves the model specified in the useModelField as well as the data passed to it from above blocks. It transform the output into a format that works well with tables nad bar graphs
        -   tf.worker.ts runs prediction on the live input using a trained model
    -   **UseModelField**
        (src/components/blockly/fields/UseModelField)
        -   Grabs the list of possible models to classify with, it will exclude any models that do not have the "status":"trained" parameter.
        -   All possible models are stored (this.\_models)
        -   Blocks can access a particular model by its name using 'getModel'

**To-dos**:

-   Add event blocks that trigger on the edge of class labels passing a certain threshold
-   Some kind of error checking to make sure that the data passed into the prediction block makes sense for the kind of model that is loaded

## <a name="model-editor"></a> Model Editor Page

[https://microsoft.github.io/jacdac-docs/tools/model-editor](https://microsoft.github.io/jacdac-docs/tools/model-editor)
**Description**: This page is a no-code interface for collecting data, training models, and testing models. It is intended for creators who want to make a model, but might be overwhelmed by the full block interface. Creators can collect data in any form they want, then train a 2D CNN that can be imported into the [Makecode extension](https://github.com/microsoft/pxt-ml) or [VM blocks](http://microsoft.github.io/jacdac-docs/editors/vm/).

**Code outline**:

-   Page deployed from src/pages/tools/model-editor.tsx
-   Main component at src/components/model-editor/ModelEditor.tsx
    The most important variables in this component are the dataset and recording. When the component loads, these items are fetched from local storage, if they exist. Then, these items are passed between the tabs as the user progresses from collecting data to training, and then finally testing the model. The tabs are:
    -   **CollectData.tsx**
        (src/components/model-editor/CollectData.tsx)
        In this component, the first section displays the collected dataset as a grid of mini Trend snapshots and as a data set plot.
        The second section allows users to collect more data. Users can set the recording parameters (recording name, class label, sampling interval, and sampling duration), then press the "Start" button to begin recording. The start button will only be active if the recording input type matches the rest of the dataset.
    -   **Train Model.tsx**
        (src/components/model-editor/TrainModel.tsx)
        This tab gives users information about a model and then allows them to train it. It then displays visualizations that allow the user to evaluate the trained model. The page only trains 10-layer, 2D CNNs.
    -   **ModelOutput.tsx**
        (src/components/model-editor/ModelOutput.tsx)
        After a model is trained, this page allows users to test the trained model on live input. The sensors selected to test the model must have the same type that the saved model was trained on.
-   Components that are used on this page (as well as in the ModelBlockEditor) include:
    -   **ModelSummary**
        (src/components/model-editor/components/ModelSummaryDropdown.tsx)
        Displays an expandable summary of the model stats including the number of layers, parameters, and estimated run time of the compiled model on a 64MHz processor.
    -   **LossAccChart**
        (src/components/model-editor/components/LossAccChart.tsx)
        Displays two line graphs with [calculated learning curves](https://machinelearningmastery.com/learning-curves-for-diagnosing-machine-learning-model-performance/) for each epoch during model training. These can be used to evaluate the quality of the model's learning.
    -   **ConfusionMatrixHeatMap**
        (src/components/model-editor/components/ConfusionMatrixHeatMap.tsx)
        After training, this heat map displays how well the newly trained model performs on a data set used to test it.
    -   **DataSetPlot**
        (src/components/model-editor/components/DataSetPlot.tsx)
        After training, a data set plot summarizes each sample as an n-dimensional data point, different shapes show which examples were classified correctly and incorrectly.

**To-dos**:

-   Collect Data - add a button to upload a dataset
-   Model Output - use a stacked line chart to display the confidence level of each model

## <a name="tf-worker"></a> TensorflowJS web worker

src/workers/tf/tf.worker.ts

**Description**: This worker is used to compile, train, and predict with TensorflowJS models. This work is pulled into a separate worker to preserve runtime on the Blockly UI.

**Code outline**:

-   "compile" takes in a JSON definition for a model architecture and object created by the MBModel (src/components/model-editor/MBModel.tsx) toJSON(). It then returns a [TensorflowJS JSON model topology object](https://www.tensorflow.org/js/guide/save_load#loading_models_with_iohandlers), [ML4F summary statistics for the model](https://github.com/microsoft/ml4f), and training parameters (derived from the JSON model architecture).
-   "train" takes an object created by the MBModel toJSON, training parameters, and a labelled dataset and returns the weights for the trained model, training log data, and am armcompiled model
    -   During training, you can subscribe to the workerProxy("tf") to receive training log data
-   "predict" takes the object created by MBModel toJSON and the unlabelled data to predict with. It returns an array containing the index of the top label (length equal to the length of the input data) and an array of maps of each class's confidence level for each input example

# Microsoft Open Source Code of Conduct

This project is hosted on a page that has adopted the Microsoft Open Source Code of Conduct.
_Resources:_

-   [Microsoft Open source Code of Conduct](https://opensource.microsoft.com/codeofconduct/)
-   [Microsoft Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/)
-   Contact [opencode@microsoft.com]() with questions or concerns
