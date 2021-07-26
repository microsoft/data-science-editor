// see https://developers.google.com/blockly/guides/create-custom-blocks/block-colour
// and https://mkweb.bcgsc.ca/colorblind/palettes.mhtml#page-container

const _palette = [
    "#2271b2",
    "#3db7e9",
    "#f748a5",
    "#359b73",
    "#d55e00",
    "e69f00",
]

export default function palette() {
    return _palette.slice(0)
}

export function paletteColorByIndex(i: number) {
    while (i < 0) i += _palette.length
    return _palette[i % _palette.length]
}
