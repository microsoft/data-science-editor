import { JDService } from "../../../jacdac-ts/src/jdom/service"

export default function useRegister(service: JDService, identifier: number) {
    return service?.register(identifier)
}
