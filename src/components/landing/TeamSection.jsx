import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const defaultTeamMembers = [
  {
    id: 1,
    name: "Santiago Weber",
    role: "Fundador & CEO",
    bio: "Nacido en Venezuela, radicado en Madrid",
    collaborations: "Ha colaborado con Alizzz, Universal Music, Warner Music Spain, YADAM, MAYO de OT, Violeta Hoddar y más de 100 artistas",
    image_url: ""
  }
];

export default function TeamSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = React.useRef(null);

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const teamMembers = config?.team_members && config.team_members.length > 0 
    ? config.team_members 
    : defaultTeamMembers;

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / teamMembers.length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / teamMembers.length;
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section className="relative py-16 overflow-hidden bg-black">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 opacity-50" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-semibold text-orange-400">El Equipo</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            ¿Quiénes Somos?
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            El equipo detrás de La Cabaña Creative
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <ArrowRight className="w-5 h-5 text-black rotate-180" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollToIndex(Math.min(teamMembers.length - 1, currentIndex + 1))}
            disabled={currentIndex === teamMembers.length - 1}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 items-center justify-center rounded-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <ArrowRight className="w-5 h-5 text-black" />
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-4 sm:px-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[280px] sm:w-[300px] snap-center"
              >
                <div className="relative h-full bg-gradient-to-b from-zinc-900/90 to-black backdrop-blur-sm rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-2xl border border-white/10">
                  
                  {/* Image Section */}
                  <div className="relative h-[240px] overflow-hidden bg-gradient-to-br from-orange-900/20 to-emerald-900/20">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 opacity-20" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    {/* Name and role overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {member.name}
                      </h3>
                      <p className="text-xs text-emerald-400 font-semibold">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-2">
                    {/* Bio */}
                    {member.bio && (
                      <p className="text-xs text-gray-400 italic">
                        {member.bio}
                      </p>
                    )}

                    {/* Collaborations */}
                    {member.collaborations && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1">Colaboraciones destacadas:</p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {member.collaborations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots Indicators */}
        {teamMembers.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`transition-all ${
                  index === currentIndex 
                    ? 'w-8 h-2 bg-orange-500 rounded-full' 
                    : 'w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}


      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}