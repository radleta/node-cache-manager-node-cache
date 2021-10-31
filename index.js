const NodeCache = require('node-cache')
/* eslint no-unused-vars:0 */
const cloneDeep = require('lodash/cloneDeep')
const isObject = require('lodash/isObject')

function clone (object) {
  if (typeof object === 'object' && object !== null) {
    return cloneDeep(object)
  }
  return object
}

/**
 * Wrapper for node-cache.
 *
 * @param {object} args - Args passed to underlying lru-cache, plus additional optional args:
 * @param {boolean} [args.shouldCloneBeforeSet=true] - Whether to clone the data being stored.
 *   Default: true
 * @param {boolean} [args.usePromises=true] - Whether to enable the use of Promises. Default: true
 */
const nodeCacheStore = function (args) {
  args = args || {}
  const self = {}
  self.name = 'node-cache'
  const Promise = args.promiseDependency || global.Promise
  self.usePromises = !(typeof Promise === 'undefined' || args.noPromises)
  self.shouldCloneBeforeSet = args.shouldCloneBeforeSet !== false // clone by default

  const instanceOpts = {
    stdTTL: args.stdTTL,
    checkperiod: args.checkperiod,
    useClones: args.useClones,
    deleteOnExpire: args.deleteOnExpire,
    enableLegacyCallbacks: args.enableLegacyCallbacks,
    maxKeys: args.maxKeys
  }

  const cacheInstance = new NodeCache(instanceOpts)

  const setMultipleKeys = function setMultipleKeys (keysValues, maxAge) {
    const length = keysValues.length
    const values = []
    for (let i = 0; i < length; i += 2) {
      cacheInstance.set(keysValues[i], keysValues[i + 1], maxAge)
      values.push(keysValues[i + 1])
    }
    return values
  }

  self.set = function (key, value, options, cb) {
    if (self.shouldCloneBeforeSet) {
      value = clone(value)
    }

    if (typeof options === 'function') {
      cb = options
      options = {}
    }
    options = options || {}

    const maxAge = (options.ttl || options.ttl === 0) ? options.ttl * 1000 : instanceOpts.stdTTL

    cacheInstance.set(key, value, maxAge)
    if (cb) {
      process.nextTick(cb.bind(null, null, true))
    } else if (self.usePromises) {
      return Promise.resolve(value)
    }
  }

  self.mset = function () {
    const args = Array.prototype.slice.apply(arguments)
    let cb
    let options = {}

    if (typeof args[args.length - 1] === 'function') {
      cb = args.pop()
    }

    if (args.length % 2 > 0 && isObject(args[args.length - 1])) {
      options = args.pop()
    }

    const maxAge = (options.ttl || options.ttl === 0) ? options.ttl * 1000 : instanceOpts.stdTTL

    const values = setMultipleKeys(args, maxAge)

    if (cb) {
      process.nextTick(cb.bind(null, null))
    } else if (self.usePromises) {
      return Promise.resolve(values)
    }
  }

  self.get = function (key, options, cb) {
    if (typeof options === 'function') {
      cb = options
    }
    const value = cacheInstance.get(key)

    if (cb) {
      process.nextTick(cb.bind(null, null, value))
    } else if (self.usePromises) {
      return Promise.resolve(value)
    } else {
      return value
    }
  }

  self.mget = function () {
    const args = Array.prototype.slice.apply(arguments)
    let cb
    let options = {}

    if (typeof args[args.length - 1] === 'function') {
      cb = args.pop()
    }

    if (isObject(args[args.length - 1])) {
      options = args.pop()
    }

    const values = args.map(function (key) {
      return cacheInstance.get(key)
    })

    if (cb) {
      process.nextTick(cb.bind(null, null, values))
    } else if (self.usePromises) {
      return Promise.resolve(values)
    } else {
      return values
    }
  }

  self.del = function () {
    let args = Array.prototype.slice.apply(arguments)
    let cb
    let options = {}

    if (typeof args[args.length - 1] === 'function') {
      cb = args.pop()
    }

    if (isObject(args[args.length - 1])) {
      options = args.pop()
    }

    if (Array.isArray(args[0])) {
      args = args[0]
    }

    args.forEach(function (key) {
      cacheInstance.del(key)
    })

    if (cb) {
      process.nextTick(cb.bind(null, null))
    } else if (self.usePromises) {
      return Promise.resolve()
    }
  }

  self.reset = function (cb) {
    cacheInstance.flushAll()
    if (cb) {
      process.nextTick(cb.bind(null, null))
    } else if (self.usePromises) {
      return Promise.resolve()
    }
  }

  self.keys = function (cb) {
    const keys = cacheInstance.keys()
    if (cb) {
      process.nextTick(cb.bind(null, null, keys))
    } else if (self.usePromises) {
      return Promise.resolve(keys)
    } else {
      return keys
    }
  }

  self.ttl = (key) => cacheInstance.getTtl(key)

  return self
}

const methods = {
  create: function (args) {
    return nodeCacheStore(args)
  }
}

module.exports = methods
