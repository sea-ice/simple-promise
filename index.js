const { PENDING, RESOLVED, REJECTED, Internal } = require('./constants')
const { executeThenMethod } = require('./executeThenMethod')
const { executeResolver } = require('./executeResolver')
const QueueItem = require('./queueItem')

function SimplePromise(resolver) {
  this.state = PENDING
  this.value = undefined
  this.queue = []

  if (resolver !== Internal) {
    executeThenMethod(this, resolver)
  }
}

SimplePromise.prototype.then = function(onFulfilled, onRejected) {
  if (
    !onFulfilled && (this.state === RESOLVED) ||
    !onRejected && (this.state === REJECTED)
  ) return this

  const newPromise = new this.constructor(Internal)
  if (this.state !== PENDING) {
    let resolver = this.state === RESOLVED ? onFulfilled : onRejected
    executeResolver(resolver, this.value, newPromise)
  } else {
    this.queue.push(new QueueItem(newPromise, onFulfilled, onRejected))
  }
  return newPromise
}

module.exports = SimplePromise