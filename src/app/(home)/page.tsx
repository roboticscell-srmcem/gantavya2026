import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/layout/hero'
import About from '@/components/blocks/about'

// Lazy load heavy components below the fold
const Gallery = dynamic(() => import('@/components/blocks/gallery'), {
  loading: () => <div className="h-96 bg-neutral-900 animate-pulse" />,
  ssr: true
})
const Events = dynamic(() => import('@/components/blocks/events'), {
  loading: () => <div className="h-96 bg-neutral-900 animate-pulse" />,
  ssr: true
})
const Sponsors = dynamic(() => import('@/components/blocks/sponsors'), {
  loading: () => <div className="h-64 bg-neutral-900 animate-pulse" />,
  ssr: true
})
const FAQ = dynamic(() => import('@/components/blocks/faq'), {
  loading: () => <div className="h-64 bg-neutral-900 animate-pulse" />,
  ssr: true
})

function Page() {
  return (
    <div>
      <Hero/>
      <About/>
      <Suspense fallback={<div className="h-96 bg-neutral-900 animate-pulse" />}>
        <Gallery/>
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-neutral-900 animate-pulse" />}>
        <Events/>
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-neutral-900 animate-pulse" />}>
        <Sponsors/>
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-neutral-900 animate-pulse" />}>
        <FAQ/>
      </Suspense>
    </div>
  )
}

export default Page