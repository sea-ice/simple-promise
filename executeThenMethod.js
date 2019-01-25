module.exports = {
  getPromiseThenMethod,
  executeThenMethod
}

const { doResolve, doReject } = require('./resolvePromise')
const { isFunction } = require('./utils')

function getPromiseThenMethod(promise) {
  if (!!promise && isFunction(promise.then)) {
    return function () {
      promise.then.apply(promise, arguments)
    }
  }
  return null
}

function executeThenMethod(waitPromise, then) {
  // 此处的then方法可能是创建waitPromise实例时给构造函数传入的函数
  // 也可能是waitPromise实例正在等待状态发生变化的其他Promise实例的then方法

  let called = false
  try {
    then(function (value) {
      if (called) return
      called = true
      doResolve(waitPromise, value)
    }, function (err) {
      if (called) return
      called = true
      doReject(waitPromise, err)
    })
  } catch (e) {
    if (called) return
    called = true
    doReject(waitPromise, e)
  }
}