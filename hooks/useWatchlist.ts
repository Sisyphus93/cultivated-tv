import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem, TVShow } from '../types';

const WATCHLIST_KEY = 'cultivated_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load from local storage
  const loadWatchlist = useCallback(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse watchlist", e);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();

    // Listen for custom events to sync across components in the same window
    const handleStorageChange = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleStorageChange);
    // Also listen to storage event for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('watchlist-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadWatchlist]);

  const addToWatchlist = (show: TVShow, bingeHours?: number) => {
    const newItem: WatchlistItem = {
      ...show,
      addedAt: Date.now(),
      bingeHours: bingeHours
    };

    const currentList = [...watchlist];
    if (!currentList.find(i => i.id === show.id)) {
      const updatedList = [newItem, ...currentList];
      setWatchlist(updatedList);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('watchlist-updated'));
    }
  };

  const removeFromWatchlist = (id: number) => {
    const updatedList = watchlist.filter(item => item.id !== id);
    setWatchlist(updatedList);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new Event('watchlist-updated'));
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some(item => item.id === id);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
};