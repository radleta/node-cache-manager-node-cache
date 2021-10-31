# node-cache-manager-node-cache

Adds [node-cache](https://github.com/node-cache/node-cache) store for [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager). Replaces the built-in LRU memory store with a memory store which supports TTL and enables usaged of refreshThreshold.

## Install

`npm i cache-manager-node-cache --save`

## Using this store

```
import NodeCacheStore from 'cache-manager-node-cache'
import cacheManager from 'cache-manager'

let memoryCache = cacheManager.caching({
    store: NodeCacheStore
})
```

Run tests with:

`npm run test`
