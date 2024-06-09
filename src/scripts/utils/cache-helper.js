import CONFIG from '../globals/config';

const CacheHelper = {
  async cachingAppShell(requests) {
    const cache = await this._openCache();
    await cache.addAll(requests);
  },

  async deleteOldCache() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name !== CONFIG.CACHE_NAME)
        .map((filteredName) => caches.delete(filteredName)),
    );
  },

  async revalidateCache(request) {
    const response = await caches.match(request);

    if (response) {
      this._fetchRequest(request);
      return response;
    }
    return this._fetchRequest(request);
  },

  async _openCache() {
    return caches.open(CONFIG.CACHE_NAME);
  },

  async _fetchRequest(request) {
    try {
      const response = await fetch(request);
      if (!response || response.status !== 200) {
        return response;
      }
      await this._addCache(request, response.clone());
      return response;
    } catch (error) {
      console.error('Fetch failed:', error);
      throw error;
    }
  },

  async _addCache(request, response) {
    const cache = await this._openCache();
    await cache.put(request, response);
  },
};

export default CacheHelper;
