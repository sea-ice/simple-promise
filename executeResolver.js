module.exports = {
  executeResolver
}

const { doResolve, doReject } = require('./resolvePromise')
const { isFunction } = require('./utils')

function executeResolver(resolver, resolvedValue, thenPromise) {
  if (resolver && isFunction(resolver)) {
    process.nextTick(function () {
      let returnVal
      try {
        returnVal = resolver(resolvedValue)
      } catch (e) {
        doReject(thenPromise, e)
      }
      console.log('recursive')
      if (returnVal === thenPromise) {
        doReject(thenPromise, new TypeError('promise can not resolve with itself.'))
      } else {
        doResolve(thenPromise, returnVal)
      }
    })
  }
}