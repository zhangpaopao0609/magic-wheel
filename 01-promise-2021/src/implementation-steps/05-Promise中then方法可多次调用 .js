// 05-Promise中then方法可多次调用 
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class BasicPromise {
  state = PENDING;
  value = undefined;
  reason = undefined;
  onFulfilledCallback = [];
  onRejectedCallback = [];

  constructor(executor) {
    const resolve = value => {  // PENDING -> FULFILLED
      if (this.state === PENDING) {
        this.state = FULFILLED;  // 状态流转
        this.value = value; // 执行函数为同步时保存 value
        this.onFulfilledCallback.forEach(onFulfilled => onFulfilled(value));  // 执行所有的 onFulfilled
      }
    };

    const reject = reason => {
      if (this.state === PENDING) {  // PENDING -> REJECTED
        this.state = REJECTED;  // 状态流转
        this.reason = reason; // 执行函数为同步时保存 reason
        this.onRejectedCallback.forEach(onRejected => onRejected(reason));  // 执行所有的 onRejected
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error); 
    };
  };
  
  then(onFulfilled, onRejected) {
    if (this.state === FULFILLED) {  // 执行函数为同步且执行了 resolve
      typeof onFulfilled === 'function' && setTimeout(() => {
         onFulfilled(this.value);
      }, 0);
    } else if (this.state === REJECTED) {  // 执行函数为同步且执行了 reject
      typeof onRejected === 'function' && setTimeout(() => {
        onRejected(this.reason);
      }, 0);
    } else {  // 执行函数为异步
      if (typeof onFulfilled === 'function') {
        this.onFulfilledCallback.push(value => setTimeout(() => onFulfilled(value), 0));
      };
      if (typeof onRejected === 'function') {
        this.onRejectedCallback.push(reason => setTimeout(() => onRejected(reason), 0));
      };
    };
  };
};

const p = new BasicPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1000);
  }, 1000);
});

p.then((value) => {
  console.log('resolve-1', value);
}, (reason) => {
  console.log('reject-1', reason);
})

p.then((value) => {
  console.log('resolve-2', value);
}, (reason) => {
  console.log('reject-2', reason);
})