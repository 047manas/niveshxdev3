"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

export function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // Only restore scroll for home page
    if (pathname === "/") {
      const restoreScroll = () => {
        const savedPosition = sessionStorage.getItem("scroll-/")
        if (savedPosition) {
          const scrollY = Number.parseInt(savedPosition, 10)

          // Multiple restoration attempts
          window.scrollTo(0, scrollY)

          requestAnimationFrame(() => {
            window.scrollTo(0, scrollY)
          })

          setTimeout(() => {
            window.scrollTo(0, scrollY)
          }, 100)
        }
      }

      // Restore scroll position
      restoreScroll()
    }
  }, [pathname])

  return null
}

export function useScrollNavigation() {
  const router = useRouter()

  const navigateWithScrollToTop = (path: string) => {
    router.push(path)
  }

  const navigateWithScrollRestore = (path: string) => {
    router.push(path)
  }

  return {
    navigateWithScrollToTop,
    navigateWithScrollRestore,
  }
}
