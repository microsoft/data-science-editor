export default function createCsvWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                "./dist/node_modules/csv-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}