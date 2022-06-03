export default function useDataUri(text: string) {
    return !!text && `data:text/plain;charset=UTF-8,${encodeURIComponent(text)}`
}
