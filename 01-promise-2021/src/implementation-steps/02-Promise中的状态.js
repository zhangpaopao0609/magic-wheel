const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class BasicPromise {
  state = PENDING;

  constructor(executor) {
    const resolve = value => {  // PENDING -> FULFILLED
      if (this.state === PENDING) {
        this.state = FULFILLED;  // 状态流转
        console.log('还要传递参数 value');
      }
    };
    const reject = reason => {
      if (this.state === PENDING) {  // PENDING -> REJECTED
        this.state = REJECTED;  // 状态流转
        console.log('还要传递参数 reason');
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error); 
    };
  };
  
  then(fn1, fn2) {};
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