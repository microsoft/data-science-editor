import { NEW_LISTENER, REMOVE_LISTENER, ERROR, CHANGE } from "./constants"
import { Observable, Observer } from "./observable"

/**
 * @category JDOM
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (...args: any[]) => void

interface Listener {
    handler: EventHandler
    once: boolean
    stackTrace?: string
}

function normalizeEventNames(eventNames: string | string[]): string[] {
    if (!eventNames) eventNames = []
    if (typeof eventNames === "string") eventNames = [eventNames]
    return eventNames
}

/**
 * Base interface for evented nodes in Jacdac
 * @category JDOM
 */
export interface IEventSource {
    readonly nodeId: number
    changeId: number

    /**
     * Subscribes to an event and returns the unsubscription handler
     * @param eventName
     * @param next
     */
    subscribe<T>(
        eventName: string | string[],
        next: (value: T) => void
    ): () => void
}

/**
 * Given a node or set of nodes, generate a stable string that can be used to track dependencies in frameworks like React.
 * @param nodes
 * @returns
 * @category JDOM
 */
export function dependencyId(nodes: IEventSource | IEventSource[]) {
    if (Array.isArray(nodes))
        return nodes?.map(node => node?.nodeId || "?").join(",") || ""
    else return nodes?.nodeId || ""
}

let nextNodeId = 0

/**
 * Base class for evented nodes in Jacdac
 * @category JDOM
 */
export class JDEventSource implements IEventSource {
    /**
     * Gets an internal unique node identifier, mostly used for debugging.
     * @category JDOM
     */
    public readonly nodeId = nextNodeId++

    private readonly listeners: Record<string, Listener[]> = {}

    /**
     * Gets a counter of event emit calls.
     * @category JDOM
     */
    readonly eventStats: Record<string, number> = {}

    /**
     * Gets a counter map from events to new listener counts
     * @category JDOM
     */
    newListenerStats: Record<string, number> = undefined

    /**
     * @internal
     */
    constructor() {}

    /**
     * Registers a handler for one or more events
     * @param eventName name or names of the events to subscribe
     * @param handler handler to register
     * @returns current object instance
     * @category JDOM
     */
    on(eventName: string | string[], handler: EventHandler) {
        if (!handler) return this
        normalizeEventNames(eventName).forEach(eventName =>
            this.addListenerInternal(eventName, handler, false)
        )
        return this
    }

    /**
     * Unregisters a handler for one or more events
     * @param eventName name or names of the events to subscribe
     * @param handler handler to unregister
     * @returns current object instance
     * @category JDOM
     */
    off(eventName: string | string[], handler: EventHandler) {
        normalizeEventNames(eventName).forEach(eventName =>
            this.removeListenerInternal(eventName, handler)
        )
        return this
    }

    /**
     * Registers a handler for one or more events to run only once.
     * @param eventName name or names of the events to subscribe
     * @param handler handler to execute
     * @returns current object instance
     * @category JDOM
     */
    once(eventName: string | string[], handler: EventHandler) {
        normalizeEventNames(eventName).forEach(eventName =>
            this.addListenerInternal(eventName, handler, true)
        )
        return this
    }

    private addListenerInternal(
        eventName: string,
        handler: EventHandler,
        once: boolean
    ): void {
        if (!eventName || !handler) {
            return
        }

        const eventListeners =
            this.listeners[eventName] || (this.listeners[eventName] = [])
        const listener = eventListeners.find(
            listener => listener.handler === handler
        )
        if (listener) {
            listener.once = !!once
            return
        }

        eventListeners.push({
            handler,
            once: !!once,
        })
        this.emit(NEW_LISTENER, eventName, handler)
    }

    private removeListenerInternal(
        eventName: string,
        handler: EventHandler
    ): void {
        if (!eventName || !handler) return

        const eventListeners = this.listeners[eventName]
        if (eventListeners) {
            for (let i = 0; i < eventListeners.length; ++i) {
                const listener = eventListeners[i]
                if (handler === listener.handler) {
                    eventListeners.splice(i, 1)
                    this.emit(REMOVE_LISTENER, eventName, handler)
                    return
                }
            }
        }
    }

    /**
     * Synchronously calls each of the listeners registered for the event named eventName,
     * in the order they were registered, passing the supplied arguments to each.
     * @param eventName
     * @param args
     * @category JDOM
     */
    emit(eventName: string, ...args: unknown[]): boolean {
        if (!eventName) return false

        // track event stats
        this.eventStats[eventName] = (this.eventStats[eventName] || 0) + 1

        const eventListeners = this.listeners[eventName]
        if (!eventListeners || eventListeners.length == 0) {
            // report unhandled errors
            if (eventName == ERROR) console.error(args[0])
            return false
        }
        for (let i = 0; i < eventListeners.length; ++i) {
            const listener = eventListeners[i]
            const handler = listener.handler
            if (listener.once) {
                eventListeners.splice(i, 1)
                --i
            }
            try {
                // eslint-disable-next-line prefer-spread
                handler.apply(null, args)
            } catch (e) {
                // avoid recursive errors in error handler
                if (eventName !== ERROR) this.emit(ERROR, e)
            }
        }
        return true
    }

    /**
     * Gets the number of listeners for a given event
     * @param eventName name of the event
     * @returns number of registered handlers
     * @category JDOM
     */
    listenerCount(eventName: string): number {
        if (!eventName) return 0
        const listeners = this.listeners[eventName]
        return listeners?.length || 0
    }

    /**
     * Gets the list stack trace where an event was registered. Only enabled if ``Flags.debug`` is true.
     * @param eventName name of the event
     * @returns stack traces where a listener was added
     * @category JDOM
     */
    listenerStackTraces(eventName: string): string[] {
        const listeners = this.listeners[eventName]
        return listeners?.map(listener => listener.stackTrace)
    }

    /**
     * Returns an array listing the events for which the emitter has registered listeners.
     * @category JDOM
     */
    eventNames(): string[] {
        return Object.keys(this.listeners)
    }

    /**
     * Creates an observable from the given event
     * @param eventName
     * @category JDOM
     */
    observe<T>(eventName: string | string[]): Observable<T> {
        return new EventObservable<T>(this, normalizeEventNames(eventName))
    }

    /**
     * Subscribes to an event and returns the unsubscription handler
     * @param eventName
     * @param next
     * @category JDOM
     */
    subscribe<T>(
        eventName: string | string[],
        next: (value: T) => void
    ): () => void {
        const observer = this.observe<T>(eventName)
        return observer.subscribe({ next }).unsubscribe
    }

    /**
     * Gets a counter for the ``CHANGE`` event.
     * @category JDOM
     */
    get changeId() {
        return this.eventStats[CHANGE] || 0
    }
}

export class JDSubscriptionScope {
    private unsubscribers: (() => void)[] = []
    private _unmounted = false

    get unmounted() {
        return this._unmounted
    }

    mount(unsubscribe: () => void): () => void {
        this._unmounted = false
        if (unsubscribe && this.unsubscribers.indexOf(unsubscribe) < 0)
            this.unsubscribers.push(unsubscribe)
        return unsubscribe
    }

    unmount() {
        const us = this.unsubscribers
        this.unsubscribers = []
        us.forEach(u => u())
        this._unmounted = true
    }
}

class EventObservable<T> implements Observable<T> {
    constructor(
        public readonly eventEmitter: JDEventSource,
        public readonly eventNames: string[]
    ) {
        //console.log(`obs`, this.eventNames)
    }

    subscribe(observer: Observer<T>) {
        //console.log(`on`, this.eventNames, observer)
        if (observer.next) this.eventEmitter.on(this.eventNames, observer.next)
        if (observer.error) this.eventEmitter.on(ERROR, observer.error)
        // never completes
        return {
            unsubscribe: () => {
                //console.log(`off`, this.eventNames, observer)
                if (observer.next)
                    this.eventEmitter.off(this.eventNames, observer.next)
                if (observer.error) this.eventEmitter.off(ERROR, observer.error)
            },
        }
    }
}
