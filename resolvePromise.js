module.exports = {
  doResolve,
  doReject
}

const { getPromiseThenMethod, executeThenMethod } = require('./executeThenMethod')
const { RESOLVED, REJECTED } = require('./constants')

function doResolve(promise, value) {
  // 判断当前resolve的value是否为Promise对象
  let then = getPromiseThenMethod(value)
  try {
    if (then) {
      if (value === promise) {
        doReject(promise, new TypeError('promise can not'))
      } else {
        executeThenMethod(promise, then)
      }
    } else {
      promise.state = RESOLVED
      promise.value = value
      promise.queue.forEach(function (item) {
        item.fulfillCallback(value)
      })
    }
  } catch (e) {
    doReject(promise, e)
  }
}

function doReject(promise, err) {
  promise.state = REJECTED
  promise.value = err
  promise.queue.forEach(function (item) {
    item.rejectCallback()
  })
}