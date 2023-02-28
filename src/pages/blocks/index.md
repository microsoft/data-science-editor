# Blocks

## Data sets

### dataset dataset preview

Loads a builtin dataset

![Snapshot of the dataset dataset preview block](./data_dataset_builtin.png)

### load dataset from url preview url

Loads a CSV dataset from an external internal URL. If the URL is a Google Sheet, it will automatically be converted to CSV.

![Snapshot of the load dataset from url preview url block](./data_load_url.png)

### load dataset from comment preview

Open the block context menu, click 'Add Comment', paste CSV data.

![Snapshot of the load dataset from comment preview block](./data_load_text.png)

## Cleanup

### replace missing column with rhs of type type preview

Fills missing data cells with the given value.

![Snapshot of the replace missing column with rhs of type type preview block](/images/blocks/data_replace_nully.png)

### drop column1 column2 column3 column4 preview

Removes the selected columns from the dataset

![Snapshot of the drop column1 column2 column3 column4 preview block](/images/blocks/data_drop.png)

### filter duplicates in column1 column2 column3 column4 preview

Removes rows with identical column values in the dataset.

![Snapshot of the filter duplicates in column1 column2 column3 column4 preview block](/images/blocks/data_drop_duplicates.png)

### rename column to name preview

Rename a columne

![Snapshot of the rename column to name preview block](/images/blocks/data_rename_column_block.png)

## Organize

### sort column order preview

Sorts the dataset based on the selected column and order.

![Snapshot of the sort column order preview block](/images/blocks/data_arrange.png)

### select column1 column2 column3 column4 preview

Keeps the selected columns and drops the others

![Snapshot of the select column1 column2 column3 column4 preview block](/images/blocks/data_select.png)

### filter column1 logic column2 preview

Selects the rows for which the condition evaluates true

![Snapshot of the filter column1 logic column2 preview block](/images/blocks/data_filter_columns.png)

### filter column logic rhs preview

Selects the rows for which the condition evaluates true

![Snapshot of the filter column logic rhs preview block](/images/blocks/data_filter_string.png)

### take count rows from operator preview

Select N rows from the sample, from the head, tail or a random sample.

![Snapshot of the take count rows from operator preview block](/images/blocks/data_slice.png)

## Compute

### compute column newcolumn as lhs logic rhs preview

Adds a new column with the result of the computation.

![Snapshot of the compute column newcolumn as lhs logic rhs preview block](/images/blocks/data_mutate_columns.png)

### compute column newcolumn as lhs logic rhs preview

Adds a new column with the result of the computation.

![Snapshot of the compute column newcolumn as lhs logic rhs preview block](/images/blocks/data_mutate_number.png)

### summarize column calculate calc preview

![Snapshot of the summarize column calculate calc preview block](/images/blocks/data_summarize.png)

### group column by by calculate calc preview

![Snapshot of the group column by by calculate calc preview block](/images/blocks/data_summarize_by_group.png)

### count distinct column preview

![Snapshot of the count distinct column preview block](/images/blocks/data_count.png)

### bin by column preview

![Snapshot of the bin by column preview block](/images/blocks/data_bin.png)

## Visualize

### scatterplot of x x y y1 y2 y3 size size group group settings ... plot

Renders the block data in a scatter plot

![Snapshot of the scatterplot of x x y y1 y2 y3 size size group group settings ... plot block](/images/blocks/chart_scatterplot.png)

### bar chart of index index y yAggregate of value group group stack settings ... plot

Renders the block data in a bar chart

![Snapshot of the bar chart of index index y yAggregate of value group group stack settings ... plot block](/images/blocks/chart_bar.png)

### pie chart of value settings ... plot

Renders the block data in a bar chart

![Snapshot of the pie chart of value settings ... plot block](/images/blocks/chart_pie.png)

### histogram of index group group settings ... plot

Renders the block data as a histogram

![Snapshot of the histogram of index group group settings ... plot block](/images/blocks/chart_histogram.png)

### boxplot of index value value settings ... plot

![Snapshot of the boxplot of index value value settings ... plot block](/images/blocks/chart_box_plot.png)

### show table column0 column1 column2 column3 column4 column5 ... table

Displays the block data as a table

![Snapshot of the show table column0 column1 column2 column3 column4 column5 ... table block](/images/blocks/chart_show_table.png)

## Statistics

### correlation of column1 column2 column3 column4 column5 column6 y preview ... plot

![Snapshot of the correlation of column1 column2 column3 column4 column5 column6 y preview ... plot block](/images/blocks/data_correlation.png)

### linear regression of x x y y1 preview ... plot

![Snapshot of the linear regression of x x y y1 preview ... plot block](/images/blocks/data_linear_regression.png)

## Data variables

### dataset variable data preview

![Snapshot of the dataset variable data preview block](/images/blocks/data_dataset_read.png)

### store in dataset variable data preview

![Snapshot of the store in dataset variable data preview block](/images/blocks/data_dataset_write.png)

## Charts

### line chart of x x y y y2 y3 group group settings ... plot

Renders the block data in a line chart

![Snapshot of the line chart of x x y y y2 y3 group group settings ... plot block](/images/blocks/chart_lineplot.png)

### heatmap of x x y y color color settings ... plot

Renders the block data in a 2D heatmap

![Snapshot of the heatmap of x x y y color color settings ... plot block](/images/blocks/chart_heatmap.png)

### scatterplot matrix column1 column2 column3 column4 group index ... plot

Renders pairwize scatter plots

![Snapshot of the scatterplot matrix column1 column2 column3 column4 group index ... plot block](/images/blocks/chart_scatterplot_matrix.png)

### chart mark settings ... fields ... chart

![Snapshot of the chart mark settings ... fields ... chart block](/images/blocks/vega_layer.png)

### encoding channel field field ... fields

![Snapshot of the encoding channel field field ... fields block](/images/blocks/vega_encoding.png)

### type type

![Snapshot of the type type block](/images/blocks/vega_encoding_type.png)

### sort order

![Snapshot of the sort order block](/images/blocks/vega_encoding_sort.png)

### sort by aggregate of field order

![Snapshot of the sort by aggregate of field order block](/images/blocks/vega_encoding_sort_field.png)

### aggregate aggregate

![Snapshot of the aggregate aggregate block](/images/blocks/vega_encoding_aggregate.png)

### time unit timeunit

![Snapshot of the time unit timeunit block](/images/blocks/vega_encoding_time_unit.png)

### bin enabled

![Snapshot of the bin enabled block](/images/blocks/vega_encoding_bin.png)
