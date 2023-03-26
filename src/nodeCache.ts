const NodeCache = require('node-cache');
const nCache = new NodeCache({
    useClones: false
});
class nodeCache {
    async setUserBlockedNodeCache() {
        const setResponse = 'as';
        return setResponse;
    }

    async getData(cacheKey) {
        return nCache.get(cacheKey);
    }

    async deleteAll(cacheKey) {
        return nCache.del(cacheKey);
    }
}

export default new nodeCache();
