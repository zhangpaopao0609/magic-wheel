// 06-Promise中then方法必须返回一个Promise对象 
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise() {}

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
    const promise2 = new FullPromise((resolve, reject) => {   // 返回一个新的 promise
      if (this.state === FULFILLED) {
        if (typeof onFulfilled === 'function') {  // onFulfilled 为函数并且 promise1 已解决
          setTimeout(() => {  // 异步执行
            try {  // 捕获错误
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);  // 运行 Promise 解决过程
            } catch (error) {  // promise2 拒绝并返回拒因 error
              reject(error);
            };
          }, 0);
        } else {
          resolve(this.value);  // onFulfilled 不是函数且 promise1 已解决， promise2 解决并返回与 promise1 相同的值
        };
      } else if (this.state === REJECTED) {
        if (typeof onRejected === 'function') {  // onRejected 为函数并且 promise1 已拒绝
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);  // 运行 Promise 解决过程
            } catch (error) {  // promise2 拒绝并返回拒因 error
              reject(error);
            };
          }, 0);
        } else {
          reject(this.reason);  // onRejected 不是函数且 promise1 已拒绝， promise2 拒绝并返回与 promise1 相同的拒因
        };
      } else {
        this.onFulfilledCallback.push(value => setTimeout(() => {  // promise1 状态未定，将 onFulfilled 放入数组中
          if (typeof onFulfilled === 'function') {  // 和同步的 onFulfilled 处理办法一样，只是执行时间不同
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
          if (typeof onRejected === 'function') {  // 和同步的 onRejected 处理办法一样，只是执行时间不同
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
