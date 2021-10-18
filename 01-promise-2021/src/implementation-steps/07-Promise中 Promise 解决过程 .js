// 07-Promise中 Promise 解决过程 
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {  //  promise2 和 x 指向同一对象，以 TypeError 为拒因拒绝 promise2
    reject(new TypeError('Chaining cycle detected for promise'));
  } else if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {  // 如果 x 是一个对象或者函数，上面第 2 点，如果 x 为 Promise，由于 Promise 也是一个对象，所以不用单独处理了
    let called = false;   // 是否被调用，用于处理当 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，仅首次调用并忽略剩下的调用
    try {
      const then = x.then;
      if (typeof then === 'function') {   // then 为函数
        then.call(x, y => {  // then 函数执行并接收两个回调函数
          if (called) return; 
          called = true;
          resolvePromise(promise, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {    
        resolve(x);   // 处理上述第 3 点中的第 4 点，  then 不是函数，以 x 为参数解决 promise2
      };
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);  // 如果 x 不为对象或者函数，以 x 为参数解决 promise2
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
    const promise2 = new FullPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        if (typeof onFulfilled === 'function') {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            };
          }, 0);
        } else {
          resolve(this.value);
        };
      } else if (this.state === REJECTED) {
        if (typeof onRejected === 'function') {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            };
          }, 0);
        } else {
          reject(this.reason);
        };
      } else {
        this.onFulfilledCallback.push(value => setTimeout(() => {
          if (typeof onFulfilled === 'function') {
            try {
              const x = onFulfilled(value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          } else {
            resolve(value);
          };
        }, 0));

        this.onRejectedCallback.push(reason => setTimeout(() => {
          if (typeof onRejected === 'function') {
            try {
              const x = onRejected(reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(reason);
          };
        }, 0));
      }
    });

    return promise2;
  };
};



Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new FullPromise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
