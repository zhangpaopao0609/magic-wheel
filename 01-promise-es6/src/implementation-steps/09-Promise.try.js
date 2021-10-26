// 09-Promise.try
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
  } 

  static reject(arg) {
    return new ES6Promise((_, reject) => reject(arg));
  };

  static all(promises) {
    if (!Array.isArray(promises)) { // 检查是否为数组，否则抛出 TypeError 错误
      throw TypeError(`${promises} is not iterable`);
    };

    return new ES6Promise((resolve, reject) => {
      const res = []; // 保存实例执行的结果
      let l = promises.length;
      if (l === 0) resolve(res);
      PubSub.subscribe('getPromiseResult', (_, [flag, valueOrReason, index]) => { // 订阅获取实例执行的结果
        if (!flag) reject(valueOrReason); // 如果其中一个实例拒绝了，直接拒绝 promiseAll
        l--;
        res[index] = valueOrReason;
        if (l === 0) resolve(res);
      });

      promises.forEach((item, index) => {
        try {
          ES6Promise.resolve(item).then(  // 发布获取实例执行的结果
            value => PubSub.publishSync('getPromiseResult', [true, value, index]),
            reason => PubSub.publishSync('getPromiseResult', [false, reason, index]),
          );
        } catch (error) {
          reject(error);
        };
      });
    });
  };

  static race(promises) {
    if (!Array.isArray(promises)) { // 检查是否为数组，否则抛出 TypeError 错误
      throw TypeError(`${promises} is not iterable`);
    };
    
    return new ES6Promise((resolve, reject) => {
      PubSub.subscribe('getPromiseResult', (_, [flag, valueOrReason]) => {
        flag ? resolve(valueOrReason) : reject(valueOrReason);
      });

      promises.forEach((item) => {
        try {
          item.then(
            value => PubSub.publishSync('getPromiseResult', [true, value]),
            reason => PubSub.publishSync('getPromiseResult', [false, reason]),
          );
        } catch (error) {
          reject(error)
        };
      });
    });
  };

  static allSettled(promises) {
    if (!Array.isArray(promises)) { // 检查是否为数组，否则抛出 TypeError 错误
      throw TypeError(`${promises} is not iterable`);
    };

    return new ES6Promise((resolve, reject) => {
      const res = []; // 保存实例执行的结果
      let l = promises.length;
      if (l === 0) resolve(res);
      PubSub.subscribe('getPromiseResult', (_, [flag, valueOrReason, index]) => { // 订阅获取实例执行的结果
        if (flag) {
          res[index] = { status: 'fulfilled', value: valueOrReason};
        } else {
          res[index] = { status: 'rejected', reason: valueOrReason};
        };
        l--;
        if (l === 0) resolve(res);
      });

      promises.forEach((item, index) => {
        try {
          ES6Promise.resolve(item).then(  // 发布获取实例执行的结果
            value => PubSub.publishSync('getPromiseResult', [true, value, index]),
            reason => PubSub.publishSync('getPromiseResult', [false, reason, index]),
          );
        } catch (error) {
          reject(error);
        };
      });
    });
  };

  static any(promises) {
    if (!Array.isArray(promises)) {
      throw TypeError(`${promises} is not iterable`);
    };

    return new ES6Promise((resolve, reject) => {
      const res = []; 
      let l = promises.length;
      if (l === 0) resolve(res);
      PubSub.subscribe('getPromiseResult', (_, [flag, valueOrReason, index]) => {
        if (flag) resolve(valueOrReason); // 如果其中一个实例解决了，直接解决 promiseAny
        l--;
        res[index] = valueOrReason;
        if (l === 0) reject(res);
      });

      promises.forEach((item, index) => {
        try {
          ES6Promise.resolve(item).then(
            value => PubSub.publishSync('getPromiseResult', [true, value, index]),
            reason => PubSub.publishSync('getPromiseResult', [false, reason, index]),
          );
        } catch (error) {
          reject(error);
        };
      });
    });
  };

  static try(tryFn) {
    if (typeof tryFn === 'function') {
      throw TypeError("It is not function!!");
    };

    return new ES6Promise(resolve => resolve(tryFn()))
  };
};

const promises1 = [
  Promise.resolve(),
  new Promise((resolve, reject) => setTimeout(() => reject(1), 1000)),
  5,
];

const promises2 = [
  ES6Promise.resolve(),
  new ES6Promise((resolve, reject) => setTimeout(() => reject(1), 1000)),
  5,
];
const p1 = Promise.any(promises1);
const p2 = ES6Promise.any(promises2);
setTimeout(() => {
  console.log(p1, p2);
}, 1100);
