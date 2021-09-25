// promise 的状态值
const PENDING = 'PENDING',
      FULFILLED = 'FULFILLED',
      REJECTED = 'REJECTED';

class BasePromise {
  constructor(executor) {
    this.status = PENDING;                // 初始状态均为 pending        
    this.value = undefined;               // promise 返回值
    this.reason = undefined;              // 错误原因
    this.onResolvedCallbacks = [];        // 保存成功的回调
    this.onRejectedCallbacks = [];        // 保存失败的回调

    // 成功时调用的方法
    const resolve = value => {
      // 只有状态为 pending 时才可以更新状态，防止 executor 中调用两次 resolve/reject 方法，只有第一个生效
      if(this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 执行回调
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    // 失败时调用的方法
    const reject = resaon => {
      if(this.status === PENDING) {
        this.status = REJECTED;
        this.reason = resaon;

        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      // 立即执行，将 resolve 和 reject 函数传给使用者
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // then 方法，接收两个参数 onFulfilled, onRejected
  then(onFulfilled, onRejected = err => { throw err }) {
    if(this.status === FULFILLED) {
      onFulfilled(this.value);
    }else if(this.status === REJECTED) {
      onRejected(this.reason);
    }else if(this.status === PENDING) {
      // 如果 promise 的状态是 PENDING,需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再一次执行对应的函数
      this.onResolvedCallbacks.push(() => onFulfilled(this.value));
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }

  catch(onRejected = err => { throw err }) {
    if(this.status === REJECTED) {
      onRejected(this.reason);
    }else if(this.status === PENDING) {
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }
};

/**
 * 执行 promise
 * @param {*} promise2 上一个 then 创建的 promise
 * @param {*} x        上一个 then 返回的 值
 * @param {*} resolve  
 * @param {*} reject 
 */
function resolvePromise(promise2, x, resolve, reject) {
  if(promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called;

  if((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;      
      if(typeof then === 'function') {    // 上一个 then 返回的值仍然是一个 promise
        then.call(x, y => {
          if(called) { return; }
          called = true;
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if(called) { return; }

          called = true;
          reject(r);
        })
      }else {
        resolve(x);
      }
    } catch (error) {
      if(called) { return; }

      called = true;
      reject(error);
    }
  }else {
    resolve(x);
  }
}

class FullPromise extends BasePromise {
  constructor(executor) {
    super(executor);
  }

  then(onFulfilled = v => v, onRejected = err => { throw err; }) {
    const promise2 = new FullPromise((resolve, reject) => {
      if(this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if(this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if(this.status === PENDING) {
        // 状态为 pending 时，收集回调
        this.onResolvedCallbacks.push(() => {
          try {
            const x = onFulfilled(this.value);

            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      }
    });

    return promise2;
  }
}

module.exports = {
  BasePromise,
  FullPromise
}