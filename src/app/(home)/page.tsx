import React from 'react'
import Hero from '@/components/layout/hero'
import About from '@/components/blocks/about'
import Sponsors from '@/components/blocks/sponsors'
import Events from '@/components/blocks/events'
import FAQ from '@/components/blocks/faq'

function Page() {
  return (
    <div>
      <Hero/>
      <About/>
      <Events/>
      <Sponsors/>
      <FAQ/>
    </div>
  )
}

export default Page