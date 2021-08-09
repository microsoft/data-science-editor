import useDbValue from "../useDbValue"

export function useSecret(id: string) {
    const { value, setValue } = useDbValue("secret:" + id, "")
    return {
        value,
        setValue,
    }
}
