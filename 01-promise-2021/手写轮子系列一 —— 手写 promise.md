[toc]

# 手写轮子系列一 —— 手写 promise（如丝般顺滑一气呵成）

Promise 是 JS 异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。

所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。可以说Promise 的出现完美的解决了回调地狱, 有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。

那么如何自己手动地来实现一个 Promise 呢？咋一看可能无从下手，但只要我们跟随着 [Promises/A+ 规范（中文翻译）](https://blog.csdn.net/qq_41800366/article/details/120788569) 一步一步地实现，你会发现，原来实现一个 Promise 是如此的简单。<font style='color: red' color='red'>**强烈建议在看本文之前先大致浏览一遍 [Promises/A+ 规范（中文翻译）](https://blog.csdn.net/qq_41800366/article/details/120788569)，看完后再来阅读本文一定会让你有恍然大悟的感觉** </font>

## 1. Promises/A+ 规范

promise 的概念最早由社区提出，提出的规范很多，其中普遍接受的是由 commonjs 社区就提出的 [Promises/A](http://wiki.commonjs.org/wiki/Promises/A) 规范。但是这一规范仍然存在一些不足，因此后来社区基于这一规范提出了 plus 规范，即  [Promises/A+ 规范（中文翻译）](https://blog.csdn.net/qq_41800366/article/details/120788569)，这一规范得到了社区的一致认可，ES6 中的 promise 便是基于此规范为标准实现的，除此之外，ES6 还添加了规范中未提及的一些方法，如： `Promise.resolve, Promise.reject, Promise.all, Promise.race, promise.catch`。

> 这里区分了大小写，大写为 Promise 的静态方法，小写为 Promise 的实例方法；<font style='color: red' color='red'>下文也同样，promise 代表实例</font>

本次手写 Promise 仅仅实现  Promises/A+ 规范中提及的方法， ES6 中实现的其它方法暂不实现（但实现方法也很简单，[可在本仓库中查看源码](https://github.com/Ardor-Zhang/magic-wheel/blob/main/01-promise-2021/src/ES6Promise.js)）。

## 2. 手摸手实现 Promise

### 2.1  基础版 Promise

#### 2.1.1 Promise 的基本结构

先来简单回顾一下 ES6 中是如何使用 Promise 的。

```js
const p = new Promise((resolve, reject) => {
  console.log('Promise 执行函数是立即执行的');
  setTimeout(() => resolve(0), 1000);
});
p.then(
  value => console.log('value:', value),
  reason =>  console.log('reason:', reason)
);
// Promise 执行函数是立即执行的
// value: 0 （1 秒以后）
```

从以上回顾可以看出：

1. Promise 是一个构造函数（ES6 中使用类）
2. new Promise 时传入一个执行函数，并且执行函数是立即执行的
3. 执行函数接收两个参数 `resolve 函数 和 reject 函数`，并且均能够接收参数
4. Promise 的实例上有一个 `then` 方法， `then` 方法接收两个参数

因此，用 ES6 的语法来实现 Promise 的基础结构：

```js
class BasicPromise {
  constructor(executor) {
    const resolve = value => {
      console.log('调用了 resolve 会将 value 传递给 then 方法的第一个函数');
    };
    const reject = reason => {
      console.log('调用了 reject 会将 reason 传递给 then 方法的第二函数');
    };
    try {
      executor(resolve, reject);  // 执行此函数时可能出错
    } catch (error) {
      reject(error); 
    };
  };
  
  then(fn1, fn2) {};  // 实例方法
};
```

#### 2.1.2 Promise 中的状态

Promises/A+ 规范中指出，一个 promise 所处的状态必须为以下三者之一：待定（pending）,兑现（fulfilled，有时候也称为 “解决”，resolved），拒绝（rejected），且初始化时状态为待定。并且只能从 “待定” 到 “兑现”，或者从 “待定” 到 “拒绝”，状态一旦确认，就不能再改变。

从 ES6 Promise 中可以看出：

- 在 promise 的执行函数中调用 `resolve` 来解决 promise 和传递值 value，也就是将一个 promise 成功地从 “待定” 状态流转为 “兑现” 状态
- 在 promise 的执行函数中调用 `reject` 来拒绝 promise 和传递值 reason（原因），也就是将一个 promise 成功地从 “待定” 状态流转为 “拒绝” 状态

结合2.1.1，实现的过程也同样：

- Promise 需要一个状态值
- 执行函数调用 resolve 或者 reject 时改变状态，并且只能从从 “待定” 到 “兑现”，或者从 “待定” 到 “拒绝”

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class BasicPromise {
  state = PENDING;

  constructor(executor) {
    const resolve = value => {  // PENDING -> FULFILLED，解决 promise
      if (this.state === PENDING) {
        this.state = FULFILLED;  // 状态流转
        console.log('还要传递参数 value');
      }
    };
    const reject = reason => {
      if (this.state === PENDING) {  // PENDING -> REJECTED，拒绝 promise
        this.state = REJECTED;  // 状态流转
        console.log('还要传递参数 reason');
      }
    };
    ...(省略代码，省略的代码即是和上述代码完全相同)
  };
  ...(省略代码，省略的代码即是和上述代码完全相同)
};
```

#### 2.1.3 Promise 中的 then 方法

**Promises/A+ 规范对 `then` 方法的实现有 7 条详细的说明**，**按照规范一步步实现即可**：

一个 promise 必须提供一个 `then` 方法以访问其当前值或者终值或者拒因。

promise 的 `then` 方法接收两个参数：

```js
promise.then(onFulfilled, onRejected)
```

1. `onFulfilled` 和 `onRejected` 都是可选参数：

   - 如果 `onFulfilled` 不是函数，必须将其忽略

   - 如果 `onRejected` 不是函数，必须将其忽略

   第 1 条实现非常的简单，只需要判断传入的值是否为函数，不是函数，直接忽略即可。

2. 如果 `onFulfilled` 是函数：

   - 当 `promise` 解决后其必须被调用，其第一个参数为 `promise` 的终值

   - 在 `promise` 解决前其不可被调用

   - 其调用次数不可超过一次

3. 如果 `onRejected` 是函数：

   - 当 `promise` 拒绝后其必须被调用，其第一个参数为 `promise` 的拒因
   - 在 `promise` 拒绝前其不可被调用
   - 其调用次数不可超过一次

   第 2 条和第 3 条是相同的处理方式，即 `onFulfilled` 或 `onRejected` 函数需要在 promise 解决或拒绝后调用，并且对应的第一个参数为终值或拒因，从 2.1.2 知，改变 promise 的状态（即解决或拒绝 promise）是在执行函数中调用 `resolve` 或 `reject` 函数，那么是不是直接在 `resolve` 或 `reject` 函数中去调用  `onFulfilled` 或 `onRejected` 函数就可以了呢？看似可行，但是有个问题是， `resolve` 或 `reject` 函数是在执行函数中而 `onFulfilled` 或 `onRejected` 函数却是在 `then` 方法中。让我们来讨论一下执行函数，假设执行函数中调用 `resolve` 函数：

   - **执行函数为同步函数**：在 `const p = new Promise(executor)` 时，执行函数会立即执行且为同步，那么 `resolve` **函数也就同步执行了，那么此时 promise 的状态也已经改变了，value 值也已得到**；然后再同步的执行 `p.then(onFulfilled, onRejected)`，此时便可以直接判断 promise 的状态来决定执行的函数。
   - **执行函数为异步函数**：在 `const p = new Promise(executor)` 时，执行函数会立即执行，但是  `resolve` 函数**却是异步执行的，此时 promise 的状态仍然为待定， value 值仍为 `undefined`**；然后再同步的执行 `p.then(onFulfilled, onRejected)`，此时可以将 `onFulfilled 和 onRejected` 函数保存下来（class 中直接保存到 this 下），等到异步执行 `resolve` 函数时，在 `resolve` 函数中执行 `onFulfilled` 并传参即可（同理 `reject` 函数中执行 `onRejected` ）。

   ```js
   // 03-Promise中的then方法
   ...(省略代码)
   
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
       
       ...(省略代码)
     };
     
     then(onFulfilled, onRejected) {
       if (this.state === FULFILLED) {  // 执行函数为同步且执行了 resolve
         typeof onFulfilled === 'function' && onFulfilled(this.value);
       } else if (this.state === REJECTED) {  // 执行函数为同步且执行了 reject
         typeof onRejected === 'function' && onRejected(this.reason);
       } else {  // 执行函数为异步
         typeof onFulfilled === 'function' && (this.onFulfilledCallback = onFulfilled);
         typeof onRejected === 'function' && (this.onRejectedCallback = onRejected);
       };
     };
   };
   ```

4. 调用时机：

   Promises/A+ 规范指出 `onFulfilled` 和 `onRejected` 并不是 promise 解决或者拒绝后就立即调用的，而是放到的任务队列中，具体何时执行需要根据实现的机制来。实践中要确保 `onFulfilled` 和 `onRejected` 函数异步地执行，并且应该是在 `then` 方法被调用后的新一轮事件循环的新执行栈中执行。这个机制可以采用 "宏任务（macro-task）"机制来实现，比如： `setTimeout` 或 `setImmediate`；也可以采用 “微任务（micro-task）” 机制来实现，比如 `MutationObserver` 或者 `process.nextTick`。

   这里采用宏任务 `setTimeout` 来实现：

   ```js
   // 04-Promise中的onFulfilled和onRejected的调用时机 
   ...(省略代码)
   
   class BasicPromise {
     ...(省略代码)
     
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
   ```

5. 调用要求：

   `onFulfilled` 和 `onRejected` 必须被作为函数调用，也就是说在 **严格模式（strict）** 中，函数 `this` 的值为 `undefined` ；在非严格模式中其为全局对象。

   > 有一点思路： ES5 中函数是可以作为构造函数使用的，可以使用 this 的，此时的 this 指向实例
   >
   > 但说实话，小生我没有完全理解到这一点，不过不影响我们实现 promise

6. then 方法可以被同一个 promise 调用多次

   - 当 promise 解决后，所有的 `onFulfilled` 需按照其注册顺序依次回调

   - 当 promise 拒绝后，所有的 `onRejected` 需按照其注册顺序依次回调

   前面只是保存了一个 `then` 方法的 `onFulfilled` 和 `onRejected`  函数，`then` 方法多次调用就会存在多个 `onFulfilled` 和 `onRejected`  函数，此时，仍然需要讨论一下执行函数：

   - **执行函数为同步函数**：依次直接 `then` 方法中直接执行即可
   - **执行函数为异步函数**：需要将所有的 `onFulfilled` 和 `onRejected`  函数都保存下来，并且依次在调用  `resolve` 或 `reject` 函数时执行，**数组即可实现，数据依次保存，然后依次执行。**

   ```js
   // 05-Promise中then方法可多次调用 
   ...(省略代码)
   
   class BasicPromise {
   	...(省略代码)
     onFulfilledCallback = [];
     onRejectedCallback = [];
   
     constructor(executor) {
       const resolve = value => {  // PENDING -> FULFILLED
         if (this.state === PENDING) {
           ...(省略代码)
           this.onFulfilledCallback.forEach(onFulfilled => onFulfilled(value));  // 执行所有的 onFulfilled
         }
       };
   
       const reject = reason => {
         if (this.state === PENDING) {  // PENDING -> REJECTED
           ...(省略代码)
           this.onRejectedCallback.forEach(onRejected => onRejected(reason));  // 执行所有的 onRejected
         }
       };
   
       ...(省略代码)
     };
     
     then(onFulfilled, onRejected) {
       ...(省略代码)
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
   ```

7. then 方法必须返回一个 Promise 对象

   这一条是完整版的内容，所以放到 2.2 中来讲述。

至此， 基本版的 promise 也就实现了（也就是 “05-Promise中then方法可多次调用” 中的代码） 。为了节省篇幅，这里就不再重复展示，点击可查看源码或者文末查看。

### 2.2 完整版 Promise

ES6 中的 Promise 是可实现链式调用和值穿透的：

- 链式调用：Promise的 `then` 函数将返回一个新的 Promise 并且当 `then` 函数中 `return` 一个值时，不管是什么值，都能在下一个` then` 中获取到，这就是 then 的链式调用
- 值穿透：当 `then` 中参数为空或非函数时，如： `promise.then('test').then().then(v => console.log(v))`， 假如此时 promise resolve 的值是 10， 那么最后的 then 依旧可以得到之前 then 返回的值10，也会打印出 10，这就是所谓的值的穿透

如何实现呢？别担心，Promises/A+ 规范对 `then` 方法的实现的第 7 条便详细的说明了实现的方法。

#### 2.2.1  then 方法必须返回一个 Promise 对象

```js
promise2 = promise1.then(onFulfilled, onRejected)
```

1. 如果 `onFulfilled` 或者 `onRejected` 为函数且返回一个值 `x` ，则运行 <font color='red'>**Promise 解决过程**</font>：`[[Resolve]](promise2, x)` （先设为 `resolvePromise` 函数）

   > “**Promise 解决过程**：`[[Resolve]](promise2, x)` ” 是指一个抽象的执行过程，这里可以直接理解成一个函数，2.2.2 会详细说明

2. 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e` ，则 `promise2` 必须拒绝并返回拒因 `e`

3. 如果 `onFulfilled` 不是函数且 `promise1` 已解决， `promise2` 必须解决并返回与 `promise1` 相同的值

4. 如果 `onRejected` 不是函数且 `promise1` 已拒绝， `promise2` 必须拒绝并返回与 `promise1` 相同的拒因

`FullPromise` 的代码除了 `then` 方法与 `BasicPromise` 不同，其它均相同，因此不再这里赘述；下面的代码完全是根据上面这 4 点写出的，因此写起来十分顺滑。

```js
// 06-Promise中then方法必须返回一个Promise对象 
...(省略代码，与 BasicPromise 一致)

function resolvePromise() {}

class FullPromise {
  ...(省略代码，与 BasicPromise 一致)
  
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
```

#### 2.2.2  Promise 解决过程

Promises/A+规范 2.3 节指出，Promise 解决过程是一个抽象的操作，其需要一个 promise 和 value 作为输入，将其表示为` [[Resolve]](promise2, x)`，如果 x 拥有 then 方法且看上去像一个 promise，解决程序即尝试使 promise2 接受 x 的状态；否则直接用 x 值来解决 promise2。

> 原文的` [[Resolve]](promise, x)`是直接写的 promise，这里为了让读者更直观的理解将 promise 改成 promise2，如此更加清晰地明白后文中解决或拒绝的 promise 是哪一个
> 这里以及下文提到的 x 是指 promise1 的 then 方法中的 onFulfilled 或者 onRejected 函数返回的值

执行 `[[Resolve]](promise2, x)` 需遵循以下步骤：

1. `x` 与 `promise2` 相等

   - 如果 `promise2` 和 `x` 指向同一对象，以 `TypeError` 为拒因拒绝 `promise2`

2. 如果 `x` 为 Promise，依据状态不同：
   - 如果 `x` 处于待定状态， `promise2` 需保持为待定状态直至  `x`  被解决或拒绝

   - 如果 `x` 处于兑现状态，用与 `x` 相同的终值解决 `promise2`

   - 如果 `x` 处于拒绝状态，用与 `x` 相同的拒因拒绝 `promise2`

3. 如果 `x` 是一个对象或者函数
   - 把 `x.then` 赋值给 `then` 

   - 如果取 `x.then` 的值时抛出错误 `e` ，则以 `e` 为拒因拒绝 `promise2`

   - 如果 `then` 是函数，将 `x` 作为函数的作用域 `this` 调用之。传递两个回调函数作为参数，第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`:

     - 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise2, y)`

     - 如果 `rejectPromise` 以拒因 `r` 为参数被调用，则以拒因 `r` 拒绝 `promise2`

     - 如果 `resolvePromise` 和 `rejectPromise` 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用

       >  这里主要是为了更好的契合 `then` 方法中 `onFulfilled` 和 `onRejected`  仅会执行其中一个和仅执行一次

   - 如果调用 `then` 方法抛出了异常 `e`：

     - 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略之

     - 否则以 `e` 为拒因拒绝 `promise2`

   - 如果 `then` 不是函数，以 `x` 为参数解决 `promise2`

4. 如果 `x` 不为对象或者函数，以 `x` 为参数解决 `promise2`

```js
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
```

如此，完整版的 Promise 也就实现了。只要照着 Promises/A+规范，一路写下来可以说是丝滑。

### 2.3 测试

Promises/A+ 规范[对应的 git 仓库](https://github.com/promises-aplus)中有一个仓库是专门用于测试参照 Promises/A+ 规范实现的 Promise —— [promises-tests](https://github.com/promises-aplus/promises-tests)，参照仓库中提供的方法对手写的 Promise 进行测试。

1. 安装 Promise 测试依赖

   ```bash
   yarn add promises-aplus-tests -D
   ```

   

2. 编写测试文件

   1. 首先在 FullPromise.js 中导出 `FullPromise`

      ```js
      module.exports = FullPromise;
      ```

   2. 然后编写测试文件

      ```js
      const FullPromise = require('../FullPromise');		// 导入 FullPromise
      // 参照 promises-tests 仓库提供的方法
      FullPromise.defer = FullPromise.deferred = function(){
        let dfd = {};
        dfd.promise = new FullPromise((resolve, reject)=>{
            dfd.resolve = resolve;
            dfd.reject = reject;
        });
        return dfd;
      };
      
      module.exports =  FullPromise;  // 最后导出即可
      ```

3. 在 package.json 中添加脚本

   ```bash
   "scripts": {
     "test": "promises-aplus-tests 填写测试文件地址"  // 如 ./src/testFullPromise.js
   },
   ```

   

4. 运行命令即可开始测试

   ```bash
   yarn test
   ```

`promises-aplus-tests` 共有 872 个测试用例，本文实现的 `FullPromise` 全部通过。

<div align='center'>
  <img src='./img/test-pass.png' />
</div>

## 3. 优化

上述的 `FullPromise` 代码完全是按照 Promises/A+ 规范来实现的，因此有很多的冗余代码，特别是 `then` 方法，下面来进行优化，主要也是对 `then` 方法进行优化：

> 这一块可能有些难度，需要你在完全理解了 FullPromise 和 Promise 解决过程后再来看

### 3.1 统一处理 `onFulfilled` 和 `onRejected` 函数

1. 当 `onFulfilled` 不是函数时，最终是解决 promise2 并传递和 promise1 相同的值，因此完全可以处理成一个传递值得函数即可：` value => value`
2. 当 `onRejected` 不是函数时，最终是拒绝 promise2 并传递和 promise1 相同的拒因，因此完全可以处理成一个抛出错误的函数即可： `reason => { throw reason }`

```js
const onFulfilledNow = typeof onFulfilled === 'function' ? onFulfilled : value => value;
const onRejectedNow = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
```

### 3.2 封装 promise 解决或拒绝后的执行逻辑

```js
const handleResolve = value => {  // 封装 promise 解决后的执行逻辑
  try {
    const x = onFulfilledNow(value);
    resolvePromise(promise2, x, resolve, reject);
  } catch (error) {
    reject(error);
  };
};

const handleReject = reason => {  // 封装 promise 拒绝后的执行逻辑
  try {
    const x = onRejectedNow(reason);
    resolvePromise(promise2, x, resolve, reject);
  } catch (error) {
    reject(error);
  };
};
```

优化后的完整代码如下：

```js
...(省略代码，省略的代码即是和 FullPromise 代码完全相同) 

class FullPromisePerfect {
	...(省略代码，省略的代码即是和 FullPromise 代码完全相同)
  
  then(onFulfilled, onRejected) {
    const onFulfilledNow = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const onRejectedNow = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    const promise2 = new FullPromisePerfect((resolve, reject) => {
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
      }
    });

    return promise2;
  };
};
```

## 4. 总结

大约一年前自己参照前辈们的代码手写过一个完整的 Promise，但那时更多的是模仿，并没有理解其原有。

前段时间再次看 Promise，然后认真的阅读并翻译了 Promises/A+ 规范才恍然大悟，原来是这样的。

原来 Promises/A+ 规范已经给出了实现步骤（也可以说是伪代码），只要跟着这一规范一步一步的来， 实现一个 Promise 绝对是如丝般顺滑。

这次重写后对 Promise 的理解上了一个新的台阶，得益于 Promises/A+ 规范，所以如果你要手写 Promise，[一定要参考这个规范](https://blog.csdn.net/qq_41800366/article/details/120788569?spm=1001.2014.3001.5501)。

## 5. 附上所有代码

1. [点击查看实现步骤的代码](https://github.com/Ardor-Zhang/magic-wheel/tree/main/01-promise-2021/src/implementation-steps)
2. [点击查看优化步骤的代码](https://github.com/Ardor-Zhang/magic-wheel/tree/main/01-promise-2021/src/optimization-steps)
3. [点击查看 FullPromisePerfect 的代码](https://github.com/Ardor-Zhang/magic-wheel/blob/main/01-promise-2021/src/FullPromisePerfect.js)
4. [点击查看ES6 Promise 的代码](https://github.com/Ardor-Zhang/magic-wheel/blob/main/01-promise-2021/src/ES6Promise.js)
