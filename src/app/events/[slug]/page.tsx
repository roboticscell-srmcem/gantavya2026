"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getEventBySlug, type EventData } from '@/lib/eventMiddleware';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RegistrationForm } from '@/components/register/form';
import { Download, Calendar, Clock, MapPin, Users, Trophy, DollarSign, Share2, ArrowUp, ChevronLeft } from 'lucide-react';

function EventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const eventData = await getEventBySlug(slug);
      setEvent(eventData);
      setLoading(false);
    }
    
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Event Not Found</h1>
          <p className="text-neutral-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link href="/#events" className="inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-800 py-4 px-8 lg:px-16">
        <Breadcrumb>
          <BreadcrumbList className="text-neutral-400">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-neutral-600" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/#events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-neutral-600" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">
                {event.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-8 lg:px-16 py-12">
        {/* Event Header */}
        <div className="mb-12">
          <Button asChild variant="ghost" className="mb-6 -ml-2">
            <Link href="/#events" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </Button>
          <div className="inline-block px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-400 text-xs font-medium uppercase tracking-wider mb-4">
            {event.category}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{event.readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-[10px] font-bold">
                G
              </div>
              <span>Gantavya Team</span>
            </div>
          </div>
        </div>

        {/* 8:3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Event Poster */}
            <div className="mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600/20 via-red-600/20 to-pink-600/20 aspect-video relative border border-neutral-800">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold opacity-20 text-white leading-tight">
                    {event.title}
                  </div>
                  <div className="mt-4 text-neutral-400 text-sm uppercase tracking-wider">
                    {event.category}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Bar */}
            <div className="mb-12 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-600/10 border border-orange-600/20">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Date</div>
                    <div className="text-white font-medium">{event.date}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/10 border border-purple-600/20">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Time</div>
                    <div className="text-white font-medium">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-pink-600/10 border border-pink-600/20">
                    <MapPin className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Location</div>
                    <div className="text-white font-medium">{event.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-4xl font-bold mt-8 mb-6 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent" {...props} />,
                  h2: ({...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 border-b border-neutral-800 pb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-100" {...props} />,
                  h4: ({...props}) => <h4 className="text-xl font-semibold mt-4 mb-2 text-neutral-200" {...props} />,
                  p: ({...props}) => <p className="text-neutral-300 leading-relaxed mb-4 text-base" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-inside mb-6 space-y-2 text-neutral-300" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-inside mb-6 space-y-2 text-neutral-300" {...props} />,
                  li: ({...props}) => <li className="ml-4 leading-relaxed" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-orange-600 pl-6 py-3 my-6 italic text-neutral-300 bg-orange-600/5 rounded-r-lg" {...props} />
                  ),
                  code: ({inline, ...props}: {inline?: boolean} & React.HTMLAttributes<HTMLElement>) => 
                    inline ? (
                      <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-orange-400 font-mono" {...props} />
                    ) : (
                      <code className="block bg-black/70 p-4 rounded-lg overflow-x-auto text-sm my-4 border border-neutral-800 font-mono" {...props} />
                    ),
                  table: ({...props}) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-neutral-800">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  th: ({...props}) => <th className="border-b border-neutral-800 px-4 py-3 bg-neutral-800/50 text-left font-semibold text-white" {...props} />,
                  td: ({...props}) => <td className="border-b border-neutral-800 px-4 py-3 text-neutral-300" {...props} />,
                  a: ({href, ...props}) => {
                    const isJavaScript = typeof href === 'string' && href.startsWith('javascript:');
                    const sanitizedHref = isJavaScript ? '#' : href;
                    const isExternal = typeof sanitizedHref === 'string' && sanitizedHref.startsWith('http');
                    return (
                      <a 
                        href={sanitizedHref} 
                        className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 hover:decoration-orange-400 transition-colors" 
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        {...props} 
                      />
                    );
                  },
                  img: ({src, alt, ...props}) => {
                    const isJavaScript = typeof src === 'string' && src.startsWith('javascript:');
                    const sanitizedSrc = isJavaScript ? '' : (typeof src === 'string' ? src : '');
                    
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={sanitizedSrc} 
                        alt={alt || 'Event image'} 
                        className="rounded-lg my-6 max-w-full h-auto border border-neutral-800"
                        loading="lazy"
                        {...props} 
                      />
                    );
                  },
                }}
              >
                {event.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar - 3 columns */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Register Now Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg shadow-orange-600/20">
                <h3 className="text-xl font-bold mb-4 text-white">Ready to Participate?</h3>
                <div className='flex flex-col gap-3'>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="w-full bg-white text-orange-600 hover:bg-neutral-100 font-semibold shadow-md"
                    size="lg"
                  >
                    Register Now
                  </Button>
                  <Button 
                    onClick={() => window.open(event.rulebookUrl || '#', '_blank')}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Brochure
                  </Button>
                </div>
              </div>
              {/* Prize Pool Card */}
              {event.prizePool && event.prizePool !== 'N/A' && (
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Prize Pool</h3>
                  </div>
                  <div className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {event.prizePool}
                  </div>
                  {event.prizes && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥇</span> First Prize
                        </span>
                        <span className="font-semibold text-yellow-500">{event.prizes.first}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥈</span> Second Prize
                        </span>
                        <span className="font-semibold text-gray-400">{event.prizes.second}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-orange-600/10 border border-orange-600/20">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥉</span> Third Prize
                        </span>
                        <span className="font-semibold text-orange-500">{event.prizes.third}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Participation Details */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                <h3 className="text-sm font-semibold mb-4 text-neutral-400 uppercase tracking-wider">Participation Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-600/10 border border-green-600/20">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-500 mb-1">Entry Fee</div>
                      <div className="text-lg font-semibold text-white">{event.participationFee}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-600/10 border border-orange-600/20">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-500 mb-1">Team Size</div>
                      <div className="text-lg font-semibold text-white">{event.teamSize}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Share Event</h3>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="flex-1 bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1 bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1 bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Back to Top Button */}
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="outline"
                className="w-full bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Back to top
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {isFormOpen && (
        <RegistrationForm
          eventSlug={event.slug}
          eventTitle={event.title}
          participationFee={event.participationFee || 'Free'}
          teamSize={event.teamSize || '1-4'}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

export default EventPage;
