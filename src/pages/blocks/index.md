# Blocks

## Data sets

![dataset dataset ](./data_dataset_builtin.png)

Loads a builtin dataset

![load dataset from url  url](./data_load_url.png)

Loads a CSV dataset from an external internal URL. If the URL is a Google Sheet, it will automatically be converted to CSV.

![load dataset from comment ](./data_load_text.png)

Open the block context menu, click 'Add Comment', paste CSV data.

## Cleanup

![replace missing column with rhs of type type ](./data_replace_nully.png)

Fills missing data cells with the given value.

![drop column1 column2 column3 column4 ](./data_drop.png)

Removes the selected columns from the dataset

![filter duplicates in column1 column2 column3 column4 ](./data_drop_duplicates.png)

Removes rows with identical column values in the dataset.

![rename column to name ](./data_rename_column_block.png)

Rename a columne

## Organize

![sort column order ](./data_arrange.png)

Sorts the dataset based on the selected column and order.

![select column1 column2 column3 column4 ](./data_select.png)

Keeps the selected columns and drops the others

![filter column1 logic column2 ](./data_filter_columns.png)

Selects the rows for which the condition evaluates true

![filter column logic rhs ](./data_filter_string.png)

Selects the rows for which the condition evaluates true

![take count rows from operator ](./data_slice.png)

Select N rows from the sample, from the head, tail or a random sample.

## Compute

![compute column newcolumn as lhs logic rhs ](./data_mutate_columns.png)

Adds a new column with the result of the computation.

![compute column newcolumn as lhs logic rhs ](./data_mutate_number.png)

Adds a new column with the result of the computation.

![summarize column calculate calc ](./data_summarize.png)

![group column by by calculate calc ](./data_summarize_by_group.png)

![count distinct column ](./data_count.png)

![bin by column ](./data_bin.png)

## Visualize

![scatterplot of x x y y1 y2 y3 size size group group settings ... plot](./chart_scatterplot.png)

Renders the block data in a scatter plot

![bar chart of index index y yAggregate of value group group stack settings ... plot](./chart_bar.png)

Renders the block data in a bar chart

![pie chart of value settings ... plot](./chart_pie.png)

Renders the block data in a bar chart

![histogram of index group group settings ... plot](./chart_histogram.png)

Renders the block data as a histogram

![boxplot of index value value settings ... plot](./chart_box_plot.png)

![show table column0 column1 column2 column3 column4 column5 ... table](./chart_show_table.png)

Displays the block data as a table

## Statistics

![correlation of column1 column2 column3 column4 column5 column6 y  ... plot](./data_correlation.png)

![linear regression of x x y y1  ... plot](./data_linear_regression.png)

## Data variables

![dataset variable data ](./data_dataset_read.png)

![store in dataset variable data ](./data_dataset_write.png)

## Charts

![line chart of x x y y y2 y3 group group settings ... plot](./chart_lineplot.png)

Renders the block data in a line chart

![heatmap of x x y y color color settings ... plot](./chart_heatmap.png)

Renders the block data in a 2D heatmap

![scatterplot matrix column1 column2 column3 column4 group index ... plot](./chart_scatterplot_matrix.png)

Renders pairwize scatter plots

![chart mark settings ... fields ... chart](./vega_layer.png)

![encoding channel field field ... fields](./vega_encoding.png)

![type type](./vega_encoding_type.png)

![sort order](./vega_encoding_sort.png)

![sort by aggregate of field order](./vega_encoding_sort_field.png)

![aggregate aggregate](./vega_encoding_aggregate.png)

![time unit timeunit](./vega_encoding_time_unit.png)

![bin enabled](./vega_encoding_bin.png)
