import { Loader } from '@googlemaps/js-api-loader';

// Singleton instance for Google Maps Loader
let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

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

export const loadGoogleMaps = async (apiKey: string): Promise<typeof google> => {
  if (!loadPromise) {
    const loader = getGoogleMapsLoader(apiKey);
    loadPromise = loader.load();
  }
  return loadPromise;
};

export const resetGoogleMapsLoader = () => {
  loaderInstance = null;
  loadPromise = null;
};
