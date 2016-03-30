'use strict'
const EventEmitter = require('events');
const co = require('co')
let chaining, toGenerator


/**
 * slice() reference.
 */

let generatorToFunction = function(event, _this, arrayOfeventHandlerGen) {
  return function(arg, res, rej) {

    co.call(_this.ctx, chaining(arg, arrayOfeventHandlerGen,
        0))
      .then(function(r) {
        /**The promse es resolved*/
        if (!(event.slice(-(4 + _this.opt.delimiter.length)) ===
            _this.opt.delimiter + 'done' ||
            event.slice(-(5 + _this.opt.delimiter.length)) ===
            _this.opt.delimiter + 'error')) {
          _this.emit(event + _this.opt.delimiter + 'done', r)
        }
        res(r)
      }).catch(function(err) {
        /**If there are a error error event is ammited and promise es rejected*/
        if (!(event.slice(-(4 + _this.opt.delimiter.length)) ===
            _this.opt.delimiter + 'done' ||
            event.slice(-(5 + _this.opt.delimiter.length)) ===
            _this.opt.delimiter + 'error')) {

          _this.emit(event + _this.opt.delimiter + 'error', err)
        }
        rej(err)
      })
  }
}

let slice = Array.prototype.slice;
/**
 * @param {Object} to be use as thisArg in every generator
 * @return {Object} instance of coEvent
 * @api public
 */
let CoEvent = function(conf, ctx) {
    /*
     * The options object is passed to EventEmitter2: see
     * https://github.com/asyncly/EventEmitter2#differences-non-breaking-compatible-with-existing-eventemitter
     */
    // {
    //
    //
    // set this to `true` to use wildcards. It defaults to `false`.
    //
    //   wildcard: true,
    //
    //
    // the delimiter used to segment namespaces, defaults to `.`.
    //
    //   delimiter: '::',
    //
    //
    // set this to `true` if you want to emit the newListener event. The default value is `true`.
    //
    //   newListener: false,
    //
    //
    // the maximum amount of listeners that can be assigned to an event, default 10.
    //
    //   maxListeners: 20
    // }
    /**
     * if is not called with new, a instance of coEvent is returned
     */
    if (!(this instanceof CoEvent)) {
      return new CoEvent()
    }
    /**
     *  EventEmitter is instanced and added to object
     */
    this.opt = {

      //
      // set this to `true` to use wildcards. It defaults to `false`.
      //
      wildcard: false,

      //
      // the delimiter used to segment namespaces, defaults to `.`.
      //
      delimiter: '.',

      //
      // set this to `true` if you want to emit the newListener event. The default value is `true`.
      //
      newListener: true,

      //
      // the maximum amount of listeners that can be assigned to an event, default 10.
      //
      maxListeners: 10
    }
    conf.delimiter && (this.opt.delimiter = conf.delimiter);
    conf.maxListeners && (this.opt._events.maxListeners = conf.maxListeners);
    conf.wildcard && (this.opt.wildcard = conf.wildcard);
    conf.newListener && (this.opt.newListener = conf.newListener);
    this.emitter = new EventEmitter(Object.assign(opt, {
      wildcard: false
    }))
    this.events = {}
      /**
       *  ctx to be used in every generator
       */
    this.ctx = ctx || this
    var _this = this
      /** @member {Function}on method to be added to instance
       * @param {String} event {Array} _eventHandler of generator to be used, can be too onle one generator
       * @return {Object} it self
       * @api public
       */
    this.on = function(event, _eventHandler) {
      _eventHandler = arguments.length > 2 ? slice.call(arguments, 1) :
        Array.isArray(_eventHandler) ? _eventHandler : [
          _eventHandler
        ]
      let eventHandler = toGenerator(_eventHandler)
      this.events[event] = this.events[event] || {}
      this.events[event].eventHandlerGen = this.events[event].eventHandlerGen !==
        undefined ? this.events[event].eventHandlerGen : []
        /**The news generator are added*/
      this.events[event].eventHandlerGen = this.events[event].eventHandlerGen
        .concat(eventHandler)
        /**The old generators are removed*/
      this.emitter.removeAllListeners(event)
      let arrayOfeventHandlerGen = this.events[event].eventHandlerGen
      this.emitter.addListener(event, generatorToFunction(event, _this,
        arrayOfeventHandlerGen))
      return this
    }

    /** @member {Function}
     * @param {String} event {Array} _eventHandler of generator to be used, can be too onle one generator
     * @return {Object} it self
     * @api public
     */
    this.once = function(event, _eventHandler) {
        _eventHandler = arguments.length > 2 ? slice.call(arguments, 1) :
          Array.isArray(_eventHandler) ? _eventHandler : [
            _eventHandler
          ]
        let eventHandler = toGenerator(_eventHandler)
        this.events[event] = this.events[event] || {}
        this.events[event].eventHandlerGen = eventHandler
        this.emitter.removeAllListeners(event)
        let arrayOfeventHandlerGen = this.events[event].eventHandlerGen
        this.emitter.once(event, generatorToFunction(event, _this,
          arrayOfeventHandlerGen))
        return this
      }
      /** @member {Function}   Adds a listener that will be fired when any event is emitted.
       *The event name is passed as the first argument to the callback
       * @param {Array} arg to be send the listener
       * @return {Promise}
       * @api public
       */
    this.onAny = function(_eventHandler) {
        _eventHandler = arguments.length > 2 ? slice.call(arguments, 1) :
          Array.isArray(_eventHandler) ? _eventHandler : [
            _eventHandler
          ]
        let eventHandler = toGenerator(_eventHandler)
        for (var prop in this.events) {
          if (this.events.hasOwnProperty(prop)) {
            this.events[prop] = this.events[prop] || {}
            this.events[prop].eventHandlerGen = this.events[prop].eventHandlerGen !==
              undefined ? this.events[prop].eventHandlerGen : []
              /**The news generator are added*/
            this.events[prop].eventHandlerGen = this.events[prop].eventHandlerGen
              .concat(eventHandler)
              /**The old generators are removed*/
            this.emitter.removeAllListeners(prop)
            let arrayOfeventHandlerGen = this.events[prop].eventHandlerGen
            this.emitter.onAny(generatorToFunction(prop, _this,
              arrayOfeventHandlerGen))
          }
        }

        return this
      }
      /** @member {Function}  Adds a listener that will execute n times for the event before being removed.
       * The listener is invoked only the first n times the event is fired, after which it is removed.
       * @param {String} _event to be emitted {Array} arg to be send the listener
       * @return {Promise} to be resolved when every iterator finish or rejected
       * if a error is catched
       * @api public
       */

    this.many = function(event, timesToListen, _eventHandler) {
        _eventHandler = arguments.length > 3 ? slice.call(arguments, 2) :
          Array.isArray(_eventHandler) ? _eventHandler : [
            _eventHandler
          ]
        let eventHandler = toGenerator(_eventHandler)
        this.events[event] = this.events[event] || {}
        this.events[event].eventHandlerGen = this.events[event].eventHandlerGen !==
          undefined ? this.events[event].eventHandlerGen : []
          /**The news generator are added*/
        this.events[event].eventHandlerGen = this.events[event].eventHandlerGen
          .concat(eventHandler)
          /**The old generators are removed*/
        this.emitter.removeAllListeners(event)
        let arrayOfeventHandlerGen = this.events[event].eventHandlerGen
        this.emitter.many(event, timesToListen, generatorToFunction(event,
          _this,
          arrayOfeventHandlerGen))
        return this
      }
      /**
       * @param {String} _event to be emitted {Array} arg to be send the listener
       * @return {Promise} to be resolved when every iterator finish or rejected
       * if a error is catched
       * @api public
       */
    this.emit = function(_event, arg) {
      arg = arguments.length > 2 ?
        slice.call(arguments, 1) : [arg];
    }
    return new Promise(function(resolve, reject) {
      let test = _this.emitter.emit(_event, arg, resolve,
        reject)
      if (!test && _event !== 'NotListener' && !(_event.slice(-
            (4 +
              _this.opt.delimiter.length)) ===
          _this.opt.delimiter + 'done' || _event.slice(-(5 +
            _this.opt
            .delimiter
            .length)) ===
          _this.opt.delimiter + 'error')) {
        _this.emit('NotListener', _event, arg).then(resolve).catch(
          reject)
      } else if (!test) {
        resolve()
      }
    });
  }
  /**
   * @param {Object}arg {Array} generators {Number} index of array of generators
   * @return {function} chained
   * @api private
   */
chaining = function(arg, array, index) {
    if (array.length === 1) {
      return array[0].apply(_this.ctx, arg)
    } else if (array.length === 2) {
      return array[0].apply(_this.ctx, arg.concat(array[1].apply(
        _this.ctx,
        arg)))
    } else if (index < (array.length - 2)) {
      return array[index].apply(_this.ctx, arg.concat(chaining(
        arg,
        array,
        index +
        1)))
    } else {
      return array[index].apply(_this.ctx, arg.concat(array[
          (index + 1) % array.length]
        .apply(
          _this.ctx,
          arg)))
    }

  }
  /**
   * @param {Array} map the arg to be a generators
   * @api private
   */
toGenerator = function(fns) {
  fns = Array.isArray(fns) ? fns : [fns]
  return fns.map(function(fn) {
    if (fn.constructor.name === 'GeneratorFunction') {
      return fn
    } else if (typeof fn === 'function') {
      return function*() {
        let arg = slice.call(arguments, 0)
        yield toGenerator(fn.apply(_this.ctx, arg))
      }
    }
    return fn
  })
}
}
/**
 * Expose `coEvent`.
 */
module.exports = CoEvent
