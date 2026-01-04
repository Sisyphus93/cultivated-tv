import React, { useEffect, useState, useRef } from 'react';
import { Star, Calendar, Globe, Circle, XCircle, Clock, Play, User, Youtube, Rabbit, Bookmark } from 'lucide-react';
import { TVShow } from '../types';
import { GENRE_MAP } from '../constants';
import { getShowDetails } from '../services/tmdbService';
import { useWatchlist } from '../hooks/useWatchlist';

interface ShowCardProps {
  show: TVShow;
  apiKey: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

// Reusable Hook for Drag-to-Scroll
const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
};

export const ShowCard: React.FC<ShowCardProps> = ({ show, apiKey }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  // Local state to handle "Drill Down" navigation (Rabbit Hole)
  const [currentShow, setCurrentShow] = useState<TVShow>(show);
  
  const [status, setStatus] = useState<string | null>(null);
  const [bingeHours, setBingeHours] = useState<number | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  
  // Independent scroll hooks for different sections
  const castScroll = useDraggableScroll();
  const recScroll = useDraggableScroll();

  const isSaved = isInWatchlist(currentShow.id);

  // Reset local state if the parent prop changes (e.g., filter change in parent)
  useEffect(() => {
    setCurrentShow(show);
  }, [show]);

  const year = currentShow.first_air_date ? currentShow.first_air_date.split('-')[0] : 'N/A';
  // Use optional chaining for genre_ids as they might be missing in some detail responses vs list responses
  const displayGenres = currentShow.genre_ids ? currentShow.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean) : [];

  useEffect(() => {
    let isMounted = true;
    setLoadingDetails(true);
    
    // Scroll to top of card container if we drilled down? 
    // Since we are replacing content in place, we might not need to scroll the window, 
    // but the transition effect handles the visual cue.
    
    const fetchDetails = async () => {
      // Small random delay for "organic" feel
      const delay = Math.random() * 300; 
      await new Promise(r => setTimeout(r, delay));

      if (!isMounted) return;
      
      try {
        const details = await getShowDetails(apiKey, currentShow.id);
        if (isMounted && details) {
          if (details.status) setStatus(details.status);
          if (details.external_ids?.imdb_id) setImdbId(details.external_ids.imdb_id);
          
          // Handle Aggregate Credits (Series Level Cast)
          if (details.aggregate_credits?.cast) {
            // Map the aggregate structure (which uses 'roles' array) to our flat CastMember structure
            const mappedCast: CastMember[] = details.aggregate_credits.cast
              .sort((a: any, b: any) => a.order - b.order) // Ensure sorting by order (0, 1, 2...)
              .slice(0, 15) // Limit to 15 top billed actors
              .map((member: any) => ({
                id: member.id,
                name: member.name,
                // In aggregate_credits, character is inside the roles array. We take the first one.
                character: member.roles && member.roles.length > 0 ? member.roles[0].character : '', 
                profile_path: member.profile_path,
                order: member.order
              }));
            setCast(mappedCast);
          } else if (details.credits?.cast) {
             // Fallback to standard credits if aggregate is missing
             const sortedCast = details.credits.cast
               .sort((a: any, b: any) => a.order - b.order)
               .slice(0, 15);
             setCast(sortedCast);
          }

          // Handle Videos (Trailer)
          if (details.videos?.results) {
            const trailer = details.videos.results.find(
              (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
            );
            setTrailerUrl(trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null);
          }

          // Handle Recommendations
          // Logic: Try 'recommendations' first, fallback to 'similar'
          const recsRaw = details.recommendations?.results?.length > 0 
            ? details.recommendations.results 
            : details.similar?.results || [];
            
          // Filter out items without posters to keep the UI clean and take top 10
          setRecommendations(recsRaw.filter((r: TVShow) => r.poster_path).slice(0, 10));

          // Handle Binge Time Calculation
          const runtimes: number[] = details.episode_run_time || [];
          const episodeCount = details.number_of_episodes || 0;

          if (runtimes.length > 0 && episodeCount > 0) {
            const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
            setBingeHours(Math.round((avgRuntime * episodeCount) / 60));
          } else if (episodeCount > 0 && details.last_episode_to_air?.runtime) {
             setBingeHours(Math.round((details.last_episode_to_air.runtime * episodeCount) / 60));
          } else {
             setBingeHours(null);
          }
        }
      } catch (e) {
        console.error("Failed to load details for", currentShow.name);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [currentShow.id, apiKey]);

  const handleRecommendationClick = (rec: TVShow) => {
    setLoadingDetails(true); // Show loading state immediately
    setCurrentShow(rec);
  };

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchlist(currentShow.id);
    } else {
      addToWatchlist(currentShow, bingeHours || undefined);
    }
  };

  const renderStatus = () => {
    if (loadingDetails) return null;
    if (!status) return null;

    let colorClass = "text-gray-500";
    let icon = <Circle size={8} fill="currentColor" />;
    
    if (status === "Returning Series") {
      colorClass = "text-green-500";
    } else if (status === "Ended") {
      colorClass = "text-red-500";
    } else if (status === "Canceled") {
      colorClass = "text-red-600";
      icon = <XCircle size={10} />;
    } else if (status === "In Production") {
      colorClass = "text-green-400";
    }

    return (
      <span className={`flex items-center gap-1.5 ${colorClass} font-bold transition-opacity duration-500 animate-fade-in`}>
        {icon}
        {status === "Returning Series" ? "RETURNING" : status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="group border-b border-gray-900 pb-8 flex flex-col sm:flex-row gap-6 items-start hover:border-gray-600 transition-colors duration-500 relative">
      <div className="absolute -left-4 top-0 bottom-8 w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Poster */}
      <div className="w-full sm:w-32 aspect-[2/3] bg-[#111] flex-shrink-0 overflow-hidden rounded-sm relative shadow-2xl shadow-black/80 group/poster">
        {currentShow.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${currentShow.poster_path}`} 
            alt={currentShow.name}
            loading="lazy"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs font-mono p-2 text-center">NO POSTER</div>
        )}

        {/* Bookmark Overlay */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-0 right-0 p-2 z-20 transition-all duration-300 hover:scale-110 focus:outline-none ${isSaved ? 'opacity-100' : 'opacity-0 group-hover/poster:opacity-100'}`}
          title={isSaved ? "Remove from My List" : "Add to My List"}
        >
          <Bookmark 
            size={20} 
            strokeWidth={2}
            fill={isSaved ? "white" : "transparent"} 
            className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full min-w-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight leading-none group-hover:text-gray-100 transition-colors">
            {currentShow.name}
          </h2>
          <div className="flex flex-col items-end pl-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-yellow-600 group-hover:text-yellow-400 font-mono transition-colors">
                <Star size={14} fill="currentColor" strokeWidth={0} />
                <span className="text-sm font-bold">{currentShow.vote_average.toFixed(1)}</span>
            </div>
            {/* Lighter color for better visibility against black */}
            <span className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors font-mono tracking-wide mt-0.5 pt-1 leading-normal">
                {currentShow.vote_count.toLocaleString()} VOTES
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-mono uppercase tracking-wider items-center min-h-[1.25rem]">
          <span className="flex items-center gap-1"><Calendar size={12} /> {year}</span>
          <span className="flex items-center gap-1"><Globe size={12} /> {currentShow.original_language}</span>
          {renderStatus()}
          {!loadingDetails && bingeHours !== null && bingeHours > 0 && (
             <span className="flex items-center gap-1 text-blue-400 animate-fade-in" title="Estimated time to watch all episodes">
               <Clock size={12} />
               {bingeHours} HOURS TO BINGE
             </span>
          )}
        </div>

        {/* Fixed Height Description Area for Symmetry */}
        <div className="h-24 overflow-y-auto my-2 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
           <p className="text-gray-400 text-sm leading-relaxed font-light">
             {currentShow.overview || "No description available for this title."}
           </p>
        </div>
        
        {/* Cast Section */}
        {!loadingDetails && cast.length > 0 && (
          <div 
            {...castScroll}
            className="flex gap-3 overflow-x-auto py-2 my-2 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden" 
            style={{ scrollbarWidth: 'none' }}
          >
             {cast.map((actor) => (
                <div key={actor.id} className="flex flex-col items-center flex-shrink-0 w-24 group/actor">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-800 bg-[#111] mb-2 group-hover/actor:border-gray-500 transition-colors pointer-events-none">
                     {actor.profile_path ? (
                       <img 
                          src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                          alt={actor.name} 
                          className="w-full h-full object-cover grayscale group-hover/actor:grayscale-0 transition-all duration-300"
                          loading="lazy"
                          draggable={false}
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <User size={20} />
                       </div>
                     )}
                  </div>
                  <div className="text-center w-full px-1">
                     <p className="text-[9px] font-bold text-gray-300 uppercase leading-tight w-full break-words line-clamp-2" title={actor.name}>
                        {actor.name}
                     </p>
                     <p className="text-[8px] text-gray-500 uppercase leading-tight line-clamp-2 w-full mt-0.5" title={actor.character}>
                        {actor.character}
                     </p>
                  </div>
                </div>
             ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-auto pt-2">
            {!loadingDetails && (
              <>
                <a 
                  href={`stremio:///detail/series/${imdbId || currentShow.id}`}
                  className="flex items-center gap-2 bg-gray-100 text-black hover:bg-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-transform hover:scale-105"
                  title="Open in Stremio"
                >
                  <Play size={10} fill="currentColor" />
                  Play on Stremio
                </a>
                
                {trailerUrl && (
                  <a 
                    href={trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 border border-gray-700 text-gray-400 hover:border-gray-300 hover:text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 bg-transparent"
                    title="Watch Trailer on YouTube"
                  >
                    <Youtube size={10} />
                    Watch Trailer
                  </a>
                )}
              </>
            )}
            
            <div className="flex flex-wrap gap-2 ml-auto">
              {displayGenres.map(genre => (
                <span key={genre} className="text-[10px] border border-gray-800 px-2 py-1 rounded-sm text-gray-500 uppercase tracking-widest hover:border-gray-600 hover:text-gray-300 transition-colors cursor-default">
                  {genre}
                </span>
              ))}
            </div>
        </div>

        {/* Rabbit Hole Section (Recommendations) */}
        {!loadingDetails && recommendations.length > 0 && (
           <div className="mt-10 pt-6 border-t border-gray-900 animate-fade-in">
              <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                 <Rabbit size={14} /> RABBIT HOLE
              </h3>
              <div 
                 {...recScroll}
                 className="flex gap-4 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden"
                 style={{ scrollbarWidth: 'none' }}
              >
                 {recommendations.map((rec) => (
                    <div 
                       key={rec.id} 
                       onClick={() => handleRecommendationClick(rec)}
                       className="flex-shrink-0 w-24 group/rec cursor-pointer"
                       title={`View ${rec.name}`}
                    >
                       <div className="aspect-[2/3] bg-[#111] overflow-hidden rounded-sm mb-2 shadow-lg relative border border-transparent group-hover/rec:border-gray-700 transition-colors">
                          <img 
                             src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`} 
                             alt={rec.name}
                             className="w-full h-full object-cover filter grayscale group-hover/rec:grayscale-0 transition-all duration-500"
                             loading="lazy"
                             draggable={false}
                          />
                          {/* Inner Shadow for Noir feel */}
                          <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] pointer-events-none" />
                       </div>
                       <p className="text-[9px] font-bold text-gray-600 group-hover/rec:text-gray-300 uppercase leading-tight truncate transition-colors text-center font-mono">
                          {rec.name}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};