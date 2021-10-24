// 03-Promise.resolve
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
      };
    };

    const reject = reason => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallback.forEach(onRejected => onRejected(reason)); 
      };
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
      };
    });

    return promise2;
  };

  catch(onRejected) { // 仅需执行 this.then(null, onRejected) 并返回结果即可
    return this.then(null, onRejected);
  };

  finally(onFinally) {
    const onFulfilled = value => {
      onFinally();
      return value;
    };
    const onRejected = reason => {
      onFinally();
      throw reason;
    };
    return this.then(onFulfilled, onRejected);
  };

  static resolve(arg) {
    if (arg instanceof ES6Promise) {
      return arg;
    } else {
      return new ES6Promise((resolve, reject) => {
        resolvePromise(null, arg, resolve, reject);
      });
    }
  };
};

const p1 = Promise.resolve(1);
const p2 = ES6Promise.resolve(1);
console.log(p1, p2);
