// promise 的状态值
const PENDING = 'PENDING',
      FULFILLED = 'FULFILLED',
      REJECTED = 'REJECTED';

class BasePromise {
  constructor(executor) {
    this.status = PENDING;            
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = value => {
      if(this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;

        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    const reject = resaon => {
      if(this.status === PENDING) {
        this.status = REJECTED;
        this.reason = resaon;

        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected = () => {}) {
    if(this.status === FULFILLED) {
      onFulfilled(this.value);
    }else if(this.status === REJECTED) {
      onRejected(this.reason);
    }else if(this.status === PENDING) {
      this.onResolvedCallbacks.push(() => onFulfilled(this.value));
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }

  catch(onRejected) {
    if(this.status === REJECTED) {
      onRejected(this.reason);
    }else if(this.status === PENDING) {
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }
}

// 用于执行 promise
function resolvePromise(promise2, x, resolve, reject) {
  if(promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called;

  if((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;
      if(typeof then === 'function') {
        then.call(x, y => {
          if(called) { return; }
          called = true;
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if(called) { return; }

          called = true;
          reject(r)
        })
      }else {
        resolve(x);
      }
    } catch (error) {
      if(called) { return; }

      called = true;
      reject(error);
    }
  }else {
    resolve(x);
  }
}

class FullPromise extends BasePromise {
  constructor(executor) {
    super(executor);
  }

  then(onFulfilled = v => v, onRejected = err => { throw err; }) {
    const promise2 = new FullPromise((resolve, reject) => {
      if(this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if(this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if(this.status === PENDING) {
        // 状态为 pending 时，收集回调
        this.onResolvedCallbacks.push(() => {
          try {
            const x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      }
    });

    return promise2;
  }
};

module.exports = {
  BasePromise,
  FullPromise
}