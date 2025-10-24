import { useState, useEffect } from 'react'

interface ViewportSize {
  width: number
  height: number
}

/**
 * Custom hook for handling viewport resize with ResizeObserver
 */
export function useResize(element?: HTMLElement): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const targetElement = element || document.body

    // ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        let width: number
        let height: number

        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize

          width = contentBoxSize.inlineSize
          height = contentBoxSize.blockSize
        } else {
          width = entry.contentRect.width
          height = entry.contentRect.height
        }

        setSize({ width, height })
      }
    })

    // Observe the target element
    resizeObserver.observe(targetElement)

    // Handle orientation changes on mobile
    const handleOrientationChange = () => {
      setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [element])

  return size
}

/**
 * Hook for detecting mobile devices
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      setIsMobile(
        mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth < 768
      )
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

/**
 * Hook for getting device pixel ratio with capping
 */
export function usePixelRatio(maxRatio: number = 2): number {
  const [pixelRatio, setPixelRatio] = useState(
    Math.min(window.devicePixelRatio || 1, maxRatio)
  )

  useEffect(() => {
    const updatePixelRatio = () => {
      setPixelRatio(Math.min(window.devicePixelRatio || 1, maxRatio))
    }

    // Listen for pixel ratio changes (rare but possible)
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    )
    mediaQuery.addEventListener('change', updatePixelRatio)

    return () => mediaQuery.removeEventListener('change', updatePixelRatio)
  }, [maxRatio])

  return pixelRatio
}
