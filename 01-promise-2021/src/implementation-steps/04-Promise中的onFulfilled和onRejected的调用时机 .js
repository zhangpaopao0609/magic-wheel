// 04-Promise中的onFulfilled和onRejected的调用时机 
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class BasicPromise {
  state = PENDING;
  value = undefined;
  reason = undefined;
  onFulfilledCallback = undefined;
  onRejectedCallback = undefined;

  constructor(executor) {
    const resolve = value => {  // PENDING -> FULFILLED
      if (this.state === PENDING) {
        this.state = FULFILLED;  // 状态流转
        this.value = value; // 执行函数为同步时保存 value
        this.onFulfilledCallback && this.onFulfilledCallback(value);  // 执行函数为异步时等到 resolve 执行时再执行 onFulfilled
      }
    };

    const reject = reason => {
      if (this.state === PENDING) {  // PENDING -> REJECTED
        this.state = REJECTED;  // 状态流转
        this.reason = reason; // 执行函数为同步时保存 reason
        this.onRejectedCallback && this.onRejectedCallback(reason);  // 执行函数为异步时等到 reject 执行时再执行 onRejected
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
        this.onFulfilledCallback = value => setTimeout(() => onFulfilled(value), 0);
      };
      if (typeof onRejected === 'function') {
        this.onRejectedCallback = reason => setTimeout(() => onRejected(reason), 0);
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
  console.log('resolve', value);
}, (reason) => {
  console.log('reject', reason);
})

i