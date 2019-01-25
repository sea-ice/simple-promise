const SimplePromise = require('../index')

test('sync resolve', done => {
  const sp = new SimplePromise((resolve, reject) => {
    resolve(123)
  })
  sp.then(val => {
    expect(val).toBe(123)
    done()
  })
})

test('resolve simple value', done => {
  const sp = new SimplePromise((resolve, reject) => {
    setTimeout(() => {
      console.log('timeout')
      resolve(123)
    }, 10)
  })
  sp.then(val => {
    expect(val).toBe(123)
    done()
  })
})

test('resolve with another promise', done => {
  // executeThenMethod(sp, constructorArg)
  // constructorArg(anotherSP => doResolve(sp, anotherSP))
  // sp.then(123 => expect(val).toBe(123))
  // sp.queue.push(123 => expect(val).toBe(123))

  // 10ms之后执行doResolve(sp, anthorSP)
  // executeThenMethod(sp, anotherSP.then)，此时sp为waitPromise，需要等待anotherSP完成，sp才能转化为resolved状态
  // (anotherSP.then)(123 => doResolve(sp, 123), err => doReject(err))
  // anotherSP.queue.push({fulfillCallback: 123 => doResolve(sp, 123)})

  // 10ms之后执行doResolve(anotherSP, 123)
  // anotherSP.state = 'RESOLVED'
  // 执行anotherSP队列中全部的fulfillCallback，即调用doResolve(sp, 123)
  // 执行sp队列中全部的fulfillCallback
  const sp = new SimplePromise((resolve, reject) => {
    setTimeout(() => {
      const anotherSP = new SimplePromise((resolve, reject) => {
        setTimeout(() => {
          resolve(123)
        }, 10)
      })
      resolve(anotherSP)
    }, 10)
  })
  sp.then(val => {
    expect(val).toBe(123)
    done()
  })
})

test('then promise resolve with resolved promise', done => {
  const sp = new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(123)
    }, 10)
  })
  sp.then(() => sp).then(val => {
    expect(val).toBe(123)
    done()
  })
})


test('then promise resolve with promise', done => {
  const sp = new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(123)
    }, 10)
  })
  // executeThenMethod(sp, constructorArg)
  // constructorArg(123 => doResolve(sp, 123)) // 执行传递给构造函数的函数
  // sp.then(123 => new Promise) // 假设返回的新的Promise对象为thenPromise1
  // sp.queue.push({fulfillCallback: 123 => executeResolver(123 => new Promise, 123, thenPromise1)})
  // thenPromise1.then(456 => expectToBe(456)) // 假设返回的Promise对象为thenPromise2
  // thenPromise1.queue.push({fulfillCallback: 456 => executeResolver(456 => expectToBe(456), 456, thenPromise2)})

  // 10ms之后执行doResolve(sp, 123)
  // sp.state = 'RESOLVED' 并执行所有fulfillCallback，即执行executeResolver(123 => new Promise, 123, thenPromise1)
  // resolver(123)返回promise对象，假设该对象为sp1，然后调用doResolve(thenPromise1, sp1)
  // 调用sp1.then，sp1.queue.push({fulfillCallback: 456 => doResolve(thenPromise1)})
  // 10ms之后doResolve(sp1)，执行所有fulfillCallback，即执行doResolve(thenPromise1)
  // 然后执行thenPromise1队列中所有的fulfillCallback，即executeResolver(456 => expectToBe(456), 456, thenPromise2)
  // 执行thenPromise1的then成功回调，并doResolve(thenPromise2)，即最后返回的thenPromise2也转化为fulfilled状态
  sp.then(() => new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(456)
    }, 10)
  })).then(val => {
    expect(val).toBe(456)
    done()
  })
})