export interface WorkerMessage {
    worker: "data" | "csv"
    id?: string
}
