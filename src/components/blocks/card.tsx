import React from "react";

interface EventCardProps {
    title?: string;
    description?: string;
    category?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

function EventCard({ 
    title = "Event Title", 
    description = "Event Description", 
    category,
    icon,
    onClick,
    className = ""
}: EventCardProps) {
    return (
        <div 
            className={`group w-full backdrop-blur-sm rounded-3xl transition-all duration-300 p-8 relative overflow-hidden cursor-pointer border border-neutral-800/50 hover:border-neutral-700 ${className}`}
            onClick={onClick}
        >
            {/* Category Label */}
            {category && (
                <div className="mb-6">
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                        {category}
                    </span>
                </div>
            )}
            
            {/* Content Container */}
            <div className="flex flex-col gap-6">
                {/* Icon */}
                {icon && (
                    <div className="w-20 h-20 flex items-center justify-center rounded-2xl transition-colors duration-300">
                        {icon}
                    </div>
                )}
                
                {/* Title */}
                <h3 className="text-3xl font-normal text-white leading-tight">
                    {title}
                </h3>
                
                {/* Description */}
                <p className="text-base text-neutral-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default EventCard;
