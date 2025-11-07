import { Loader } from '@googlemaps/js-api-loader';

// Singleton instance for Google Maps Loader
let loaderInstance: Loader | null = null;
let loadPromise: Promise<void> | null = null;

export const getGoogleMapsLoader = (apiKey: string): Loader => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      language: 'ar',
      region: 'EG'
    });
  }
  return loaderInstance;
};

export const loadGoogleMaps = async (apiKey: string): Promise<void> => {
  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=ar&region=EG`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  return loadPromise;
};

export const resetGoogleMapsLoader = () => {
  loaderInstance = null;
  loadPromise = null;
};
