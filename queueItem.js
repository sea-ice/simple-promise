module.exports = QueueItem

const { doResolve, doReject } = require('./resolvePromise')
const { executeResolver } = require('./executeResolver')

function QueueItem(thenPromise, onFulfill, onReject) {
  this.fulfillCallback = function (val) {
    onFulfill ?
      executeResolver(onFulfill, val, thenPromise) :
      doResolve(thenPromise, val)
  }
  this.rejectCallback = function (err) {
    onReject ?
      executeResolver(onReject, err, thenPromise) :
      doReject(thenPromise, err)
  }
}