/* global describe, it, expect, beforeAll */

import NodeCacheStore from '../index'
import cacheManager from 'cache-manager'

let nodeCache = null

beforeAll(function () {
  nodeCache = cacheManager.caching({
    store: NodeCacheStore
  })
})

describe('set', function () {
  it('should store a value without ttl', function (done) {
    nodeCache.set('foo', 'bar', function (err, ok) {
      expect(err).toBe(null)
      expect(ok).toBe(true)
      done()
    })
  })

  it('should store a value with a specific ttl', function (done) {
    nodeCache.set('foo', 'bar', 30, function (err, ok) {
      expect(err).toBe(null)
      expect(ok).toBe(true)
      done()
    })
  })
})

describe('get', function () {
  it('should retrieve a value for a given key', function (done) {
    const value = 'bar'
    nodeCache.set('foo', value, function () {
      nodeCache.get('foo', function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })

  it('should retrieve a value for a given key if options provided', function (done) {
    const value = 'bar'
    nodeCache.set('foo', value, function () {
      nodeCache.get('foo', {}, function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })
})

describe('del', function () {
  it('should delete a value for a given key', function (done) {
    nodeCache.set('foo', 'bar', function () {
      nodeCache.del('foo', function (err) {
        expect(err).toBe(null)
        done()
      })
    })
  })

  it('should delete a value for a given key without callback', function (done) {
    nodeCache.set('foo', 'bar', function () {
      nodeCache.del('foo')
      done()
    })
  })
})

describe('reset', function () {
  it('should flush underlying db', function (done) {
    nodeCache.set('foo', 'bar', function () {
      nodeCache.reset(function (err) {
        expect(err).toBe(null)

        nodeCache.get('foo', function (err, value) {
          expect(err).toBe(null)
          expect(value).toBe(undefined)
          done()
        })
      })
    })
  })
})

describe('keys', function () {
  it('should get all the keys', function (done) {
    nodeCache.reset(function (err) {
      expect(err).toBe(null)

      nodeCache.set('foo', 'bar', function () {
        nodeCache.keys(function (err, keys) {
          expect(err).toBe(null)
          expect(Object.keys(keys).length).toBe(1)
          done()
        })
      })
    })
  })
})
