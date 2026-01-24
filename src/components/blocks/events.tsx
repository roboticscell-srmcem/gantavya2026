"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EventCard from './card'
import { getAllEvents, type EventData } from '@/lib/eventMiddleware'

function Grid() {
    const router = useRouter();
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            const eventsData = await getAllEvents();
            setEvents(eventsData);
            setLoading(false);
        }

        fetchEvents();
    }, []);

    // Icon mapping for different event categories
    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'technology':
                return (
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                );
        }
    };

    return (
        <div id="events" className='w-full md:min-h-screen relative py-12 sm:py-16 md:py-20'>
            <div className='mt-6 sm:mt-8 h-16 sm:h-20 w-auto max-w-xs mx-4 sm:mx-0 text-lg sm:text-xl md:text-2xl flex items-center justify-start sm:justify-center gap-2 sm:gap-3'>
                <span className='text-transparent bg-neutral-300 h-1 w-8 sm:w-12'>..........</span>
                <span className='text-white flex items-center justify-center whitespace-nowrap'>What to expect</span>
            </div>

                <div className="max-w-4xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-justify">
                        <span className="text-neutral-500">What to expect </span>
                        <span className="text-white">Gantavya 2026</span>
                    </h2>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            ) : (
                <div className='max-w-9xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-10 md:py-12'>
                    {/* Cards Grid - 2 columns on large screens, 1 on small */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mx-auto'>
                        {events.map((event) => (
                            <EventCard
                                key={event.slug}
                                category={`FOR ENTHUSIASTS`}
                                title={event.title}
                                description={event.shortDescription}
                                icon={getIcon(event.category)}
                                onClick={() => router.push(`/events/${event.slug}`)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Grid

