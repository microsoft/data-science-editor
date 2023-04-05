// see https://developers.google.com/blockly/guides/create-custom-blocks/block-colour
// and https://mkweb.bcgsc.ca/colorblind/palettes.mhtml#page-container

const _palette = [
    "#506d87",
    "#6ba4bd",
    "#d170a1",
    "#62726c",
    "#ab672e",
    "#b99031",
    "#17bc14",
];

export default function palette() {
    return _palette.slice(0);
}

export function paletteColorByIndex(i: number) {
    while (i < 0) i += _palette.length;
    return _palette[i % _palette.length];
}

export const [
    datasetColour,
    operatorsColour,
    computeColour,
    statisticsColour,
    visualizeColour,
    cleaningColour,
] = palette();
export const chartColour = visualizeColour;
