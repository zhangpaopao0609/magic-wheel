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

class FullPromise {
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
    // 当 onFulfilled 不是函数时，最终是解决 promise2 并传递和 promise1 相同的值，因此完全可以处理成一个传递值得函数即可： value => value
    const onFulfilledNow = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // 当 onRejected 不是函数时，最终是拒绝 promise2 并传递和 promise1 相同的拒因，因此完全可以处理成一个抛出错误的函数即可： reason => { throw reason }
    const onRejectedNow = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new FullPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilledNow(value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          };
        }, 0);
      } else if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejectedNow(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          };
        }, 0);
       
      } else {
        this.onFulfilledCallback.push(value => setTimeout(() => {
          try {
            const x = onFulfilledNow(value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          };
        }, 0));

        this.onRejectedCallback.push(reason => setTimeout(() => {
          try {
            const x = onRejectedNow(reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          };
        }, 0));
      }
    });

    return promise2;
  };
};

module.exports = FullPromise;
