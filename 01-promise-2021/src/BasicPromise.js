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
    if (this.state === FULFILLED) { 
      typeof onFulfilled === 'function' && setTimeout(() => {
         onFulfilled(this.value);
      }, 0);
    } else if (this.state === REJECTED) {
      typeof onRejected === 'function' && setTimeout(() => {
        onRejected(this.reason);
      }, 0);
    } else {
      if (typeof onFulfilled === 'function') {
        this.onFulfilledCallback.push(value => setTimeout(() => onFulfilled(value), 0));
      };
      if (typeof onRejected === 'function') {
        this.onRejectedCallback.push(reason => setTimeout(() => onRejected(reason), 0));
      };
    };
  };
};
