const PubSub = require('pubsub-js');

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected for promise'));
  } else if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {
    let called = false;
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      };
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}; 

class ES6Promise {
  state = PENDING;
  value = undefined;
  reason = undefined;
  onFulfilledCallback = [];
  onRejectedCallback = [];

  constructor(executor) {
    const resolve = value => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallback.forEach(onFulfilled => onFulfilled(value));
      }
    };

    const reject = reason => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallback.forEach(onRejected => onRejected(reason)); 
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error); 
    };
  };
  
  then(onFulfilled, onRejected) {
    const onFulfilledNow = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const onRejectedNow = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    const promise2 = new ES6Promise((resolve, reject) => {
      const handleResolve = value => {
        try {
          const x = onFulfilledNow(value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        };
      };

      const handleReject = reason => {
        try {
          const x = onRejectedNow(reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        };
      };

      if (this.state === FULFILLED) {
        setTimeout(() => handleResolve(this.value), 0);
      } else if (this.state === REJECTED) {
        setTimeout(() => handleReject(this.reason), 0);
      } else {
        this.onFulfilledCallback.push(value => setTimeout(() => handleResolve(value), 0));
        this.onRejectedCallback.push(reason => setTimeout(() => handleReject(reason), 0));
      }
    });

    return promise2;
  };

  catch(onRejected) {
    const onRejectedNow = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    const promise2 = new ES6Promise((resolve, reject) => {
      const handleReject = reason => {
        try {
          const x = onRejectedNow(reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        };
      };

      if (this.state === REJECTED) {
        setTimeout(() => handleReject(this.reason), 0);
      } else if(this.state === PENDING) {
        this.onRejectedCallback.push(reason => setTimeout(() => handleReject(reason), 0));
      }
    });

    return promise2;
  };

  static resolve(value) {
    return new ES6Promise(resolve => resolve(value));
  }

  static reject(reason) {
    return new ES6Promise((_, reject) => reject(reason));
  }

  static all(promises) {
    // 利用发布订阅的机制
    // 只要有一个失败，直接返回拒绝的 promise，全部成功后返回解决的 promise
    if (!promises || !Array.isArray(promises) || promises.length === 0) {
      throw new Error('not iterable');
    };
    const promise = new ES6Promise((resolve, reject) => {
      let l = promises.length;
      const res = [];
      PubSub.subscribe('observe', (_, [flag, valueOrReason, index]) => {
        if (!flag) reject(valueOrReason);
        l--;
        res[index] = valueOrReason;
        if (l === 0) resolve(res);
      });

      promises.forEach((item, index) => {
        try {
          item.then(
            value => PubSub.publishSync('observe', [true, value, index]),
            reason => PubSub.publishSync('observe', [false, reason, index]),
          );
        } catch (error) {
          reject(error)
        };
      });
    });
    return promise;
  }

  static race(promises) {
    // 同样利用发布订阅的机制
    // 只要有一个成功或者失败，直接返回解决的 promise或返回拒绝的 promise
    if (!promises || !Array.isArray(promises) || promises.length === 0) {
      throw new Error('not iterable');
    };
    const promise = new ES6Promise((resolve, reject) => {
      PubSub.subscribe('observe', (_, [flag, valueOrReason]) => {
        if (flag) {
          resolve(valueOrReason)
        } else {
          reject(valueOrReason);
        }
      });

      promises.forEach((item) => {
        try {
          item.then(
            value => PubSub.publishSync('observe', [true, value]),
            reason => PubSub.publishSync('observe', [false, reason]),
          );
        } catch (error) {
          reject(error)
        };
      });
    });
    return promise;
  }
};


const p0 = ES6Promise.resolve(1);
p0.then(value => console.log('p0-resolve-', value))

const p1 = ES6Promise.reject(2);
p1.then(null, reason => console.log('p1-reject-', reason))

p0.catch(reason => console.log('p0-resolve-catch', reason));
p1.catch(reason => console.log('p1-reject-catch', reason));


// const p3 = Promise.all([p0]);
// setTimeout(() => {
//   console.log(p3);
// }, 10);

const p4 = ES6Promise.all([p0, p1]);
setTimeout(() => {
  console.log(p4);
}, 10);