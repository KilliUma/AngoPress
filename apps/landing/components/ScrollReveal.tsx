'use client'

import { useEffect } from 'react'

const SELECTORS = '.reveal, .reveal-left, .reveal-right, .reveal-scale'

export function ScrollReveal() {
  useEffect(() => {
    const observe = (el: Element) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.disconnect()
          }
        },
        { threshold: 0.08 },
      )
      observer.observe(el)
      return observer
    }

    // Observe all current elements
    const observers = Array.from(document.querySelectorAll(SELECTORS)).map(observe)

    // Also watch for new elements added dynamically
    const mutation = new MutationObserver(() => {
      document.querySelectorAll(`${SELECTORS}:not(.visible)`).forEach((el) => {
        observe(el)
      })
    })
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observers.forEach((o) => o.disconnect())
      mutation.disconnect()
    }
  }, [])

  return null
}
