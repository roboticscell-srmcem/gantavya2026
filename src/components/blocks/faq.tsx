"use client";

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function FAQ() {

const faqData = [
  {
    question: "How can I register for an event?",
    answer:
      "To register, visit our official event website and fill out the registration form under the \"Register\" section. You'll receive a confirmation email with your participant ID and event details once your registration is complete. Early registration is advised, as spots are limited.",
  },
  {
    question: "What types of events do you organize?",
    answer:
      "We organize a wide range of events including conferences, workshops, seminars, competitions, cultural festivals, and networking sessions. Each event is tailored to meet specific objectives and audience needs, ensuring a memorable experience for all participants.",
  }
];

  const faqData2 = [  {
    question: "Can I participate in more than one event?",
    answer:
      "Yes. Participants are allowed to compete in multiple categories as long as event schedules do not overlap. Make sure to register separately for each event you wish to join.",
  },
  {
    question: "Will equipment or kits be provided by the organizers?",
    answer:
      "Participants are expected to bring their own robots and necessary equipment. Basic power sources and arena setups will be provided at the venue. Check individual event rules on the website for exact specifications.",
  },
  {
    question: "Is there an online participation option?",
    answer:
      "No. Due to the nature of the competitions, all events will be held on-site. However, key highlights and final rounds will be streamed live on our official YouTube and Instagram channels.",
  },
  {
    question: "What is the dress code for participants?",
    answer:
      "The dress code is casual but functional — wear comfortable clothing suitable for working with hardware, wiring, and robotics setups. Closed-toe shoes are recommended for safety.",
  },
  {
    question: "How can I become a sponsor or exhibitor?",
    answer:
      "Visit the Sponsorship page on our website and fill out the inquiry form. Our team will contact you with detailed sponsorship and exhibition options, including branding and booth setup benefits.",
  },
  {
    question: "Are there networking or workshop opportunities?",
    answer:
      "Yes. The event includes technical workshops, mentorship sessions, and networking breaks where participants can meet robotics experts, industry partners, and other innovators.",
  },
  {
    question: "Will there be prizes for winners?",
    answer:
      "Absolutely. Each category offers exciting cash prizes, certificates, and sponsorship opportunities for standout teams. Details on prize distribution are available on the event rules page.",
  },
  {
    question: "Who can participate in the robotics competitions?",
    answer:
      "The event is open to students, enthusiasts, and independent teams passionate about robotics and automation. Whether you're a beginner or an experienced builder, there's a challenge for everyone.",
  },
]
  return (
    <div className='min-h-screen w-screen bg-black relative flex flex-col tracking-tighter pb-40'>
      {/* Gradient transition for seamless blend with next section */}
      <div className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-30'></div>
      
      <div className="relative mx-4 mt-24 h-20 text-2xl flex items-center justify-start gap-6 px-8 lg:px-16">
        <span className="text-transparent bg-neutral-300 h-1 w-12">..........</span>
        <span className="text-white flex items-center justify-center">Questions</span>
      </div>
      
      <div className='w-full flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16 px-8 lg:px-16'>
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
          <div className="text-5xl lg:text-6xl">
        <span className="text-white tracking-tighter">
          Frequently Asked Questions
          <span className="text-neutral-500"> About Our Events</span>
        </span>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2">
          <Accordion type="single" collapsible className="space-y-2">
        {faqData.map((item, i) => (
          <AccordionItem 
            key={i} 
            value={`item-${i}`}
            className="border-0 rounded-3xl px-8 py-4 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all duration-300"
          >
            <AccordionTrigger className="text-xl font-normal text-white hover:no-underline py-6">
          {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 text-base leading-relaxed pt-2 pb-4">
          {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
          </Accordion>
        </div>
      </div>
      <div className="w-full px-8 lg:px-16 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {faqData2.map((item, i) => (
        <Accordion key={i} type="single" collapsible>
          <AccordionItem 
            value={`item-${i}`}
            className="border-0 rounded-3xl px-8 py-4 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all duration-300"
          >
            <AccordionTrigger className="text-xl font-normal text-white hover:no-underline py-6">
          {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 text-base leading-relaxed pt-2 pb-4">
          {item.answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ;
