import { useEffect, useState, RefObject } from 'react'

export interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export default function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options?: { freezeOnceVisible?: boolean } & IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible } = options || {};

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    //console.log(`observe`, { node })
    observer.observe(node)

    return () => observer.disconnect()

  }, [elementRef, threshold, root, rootMargin, frozen])

  return entry
}
