// Google Maps Loader Utility - Uses Forge Proxy
// This file provides compatibility for legacy code that uses loadGoogleMaps

let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = async (apiKey?: string): Promise<void> => {
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
      const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

      const scriptUrl = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&libraries=places,drawing,geometry,visualization,marker`;
      
      fetch(scriptUrl, {
        method: 'GET',
        headers: { 'Origin': window.location.origin },
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.text();
        })
        .then(scriptContent => {
          const script = document.createElement('script');
          script.textContent = scriptContent;
          document.head.appendChild(script);
          
          const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogle);
              resolve();
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkGoogle);
            reject(new Error('Google Maps failed to load'));
          }, 10000);
        })
        .catch(error => {
          console.error('Failed to fetch Google Maps script:', error);
          reject(error);
        });
    });
  }
  return loadPromise;
};

export const resetGoogleMapsLoader = () => {
  loadPromise = null;
};

// Compatibility export
export const getGoogleMapsLoader = () => ({ load: loadGoogleMaps });
