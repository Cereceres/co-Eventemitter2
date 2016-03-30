'use strict'
let assert = require('assert')
let CoEvent = require('../index')
let count = 0,
  i = 0

describe('Test for Coevent', function() {
  this.timeout(10000)
  before(function() {
    this.Myemmiter = new CoEvent({
      wildcard: true
    })
    this.gen1 = function*(arg, next) {
      count++
      let res = yield Promise.resolve(4)
      assert.equal(res, 4)
      yield next
      assert.equal(arg, 'hola')
    }

    this.gen2 = function*(arg) {
      count++
      let res = yield Promise.resolve('54')
      assert.equal(res, '54')
      assert.equal(arg, 'hola')
      let n = Math.random()
      if (n < 0.5) {
        throw n
      } else {
        return '_'
      }
    }
    this.Myemmiter.on('test', this.gen1, this.gen2)
    this.Myemmiter.on('testWithError', function*(arg) {
      assert(!arg || arg === 'test')
      let res = yield Promise.resolve(0)
      assert.equal(res, 0)
      throw 'error'
    })

    this.Myemmiter.on('testWithError.error', function*(error) {
      let res = yield Promise.resolve(1)
      assert.equal(res, 1)
      assert.equal(error, 'error')
    })

    this.Myemmiter.on('test.done', function*(_r) {
      assert(_r === undefined || _r === '_')
      let res = yield Promise.resolve(2)
      assert.equal(res, 2)
      i++
    })
    this.Myemmiter.on('NotListener', function*(event, arg) {
      let res = yield Promise.resolve('al chingaso')
      assert.equal(res, 'al chingaso')
      assert(arg === 'with tortillas of harina' || arg === 'test')
      assert.equal(event, 'carne asada!!!')
      throw event + 'catched'
    })
  })
  it('should count the calls to emmiter', function(done) {
    this.Myemmiter.emit('test', 'hola')
      .then(function() {
        assert.equal(count, 2)
        setTimeout(function() {
          assert(i === 1)
          done()
        }, 100);

      })
      .catch(function(err) {
        assert(err < 0.5)
        done()
      })
  })

  it('should emit the .error event and reject the promise returned',
    function(done) {
      this.Myemmiter.emit('testWithError').catch(function(e) {
        assert.equal(e, 'error')
        done()
      })

    })

  it(
    'NotListener event have to be emmited when the event does not have listener',
    function(done) {
      this.Myemmiter.emit('carne asada!!!', 'with tortillas of harina').catch(
        function(e) {
          assert.equal(e, 'carne asada!!!catched')
          done()
        })

    })

  it(
    'all avents are emitted with *',
    function(done) {
      this.Myemmiter.emit('carne asada!!!', 'with tortillas of harina').catch(
        function(e) {
          assert.equal(e, 'carne asada!!!catched')
          done()
        })

    })
})
