import { useEffect } from 'react'

export function MotionDirector() {
  useEffect(() => {
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      return
    }

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          revealObserver.unobserve(entry.target)
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )
    const revealElements = document.querySelectorAll<HTMLElement>('.reveal:not(.is-revealed)')
    revealElements.forEach((element) => {
      element.classList.add('motion-pending')
      revealObserver.observe(element)
    })

    let frame = 0
    const updateParallax = () => {
      frame = 0
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
        const speed = Number(element.dataset.parallax ?? '0.08')
        const offset = (window.innerHeight * 0.5 - element.getBoundingClientRect().top) * speed
        element.style.setProperty('--parallax-y', `${Math.max(-55, Math.min(55, offset))}px`)
      })
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateParallax) }
    updateParallax()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      revealObserver.disconnect()
      revealElements.forEach((element) => element.classList.remove('motion-pending'))
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
