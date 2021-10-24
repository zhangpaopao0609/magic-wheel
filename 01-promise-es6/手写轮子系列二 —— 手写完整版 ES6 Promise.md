[toc]

# 手写轮子系列二 —— 手写完整版 ES6 Promise 

在阅读本文前，前务必已阅读 [手写轮子系列一 —— 手写 Promise](https://blog.csdn.net/qq_41800366/article/details/120830777?spm=1001.2014.3001.5502) 一文，此文参照 Promises/A+ 规范完整地实现了 Promise 对象，本文是在此基础上实现 ES6 Promise 额外的内容。

ES6 Promise 同样是参照 Promises/A+ 规范实现的，但 ES6 Promise 还额外增加了两个实例方法：

- `Promise.prototype.catch()`
- `Promise.prototype.finally()` ES2018 引入

七个静态方法：

- `Promise.resolve()`
- `Promise.reject()`
- `Promise.all()`
- `Promise.race()`
- `Promise.allSettled()` ES2020 引入
- `Promise.any()` ES2021 引入
- `Promise.try()` [提案阶段](https://github.com/tc39/proposal-promise-try)

上述方法部分常用，部分陌生，因此本文将简单的概述各方法的基本使用然后再详细的讲述实现的过程。再次说明，本文是在  [手写轮子系列一 —— 手写 Promise](https://blog.csdn.net/qq_41800366/article/details/120830777?spm=1001.2014.3001.5502) 一文基础上实现 ES6 Promise 额外内容，因此，请在阅读本文前阅读这一文章，否者你有可能无法很好的理解。

> 备注： 文中 Promise（即大写）指代 Promise 对象；promise（小写）指代 Promise 的实例

## 1. 两个实例方法

### 1.1 `Promise.prototype.catch()`

`Promise.prototype.catch() `**方法是 `.then(null, onRejected)` 或 `.then(undefined, onRejected)` 的别名**，用于指定 `promise` 拒绝后的回调函数。

因此，实现的方法也非常的简单，只需要执行并返回 `.then(null, onRejected)` 或 `.then(undefined, onRejected)` 即可（此处代码便是 [手写轮子系列一 —— 手写 Promise](https://blog.csdn.net/qq_41800366/article/details/120830777?spm=1001.2014.3001.5502) 一文中最终的 `FullPromisePerfect` 代码，省略部分说明并未改动）。

```js
// 01-Promise.prototype.catch
...(省略代码，即此处代码相较前文完全未改动)

class ES6Promise {		// 将前文最终的 FullPromisePerfect 改为了 ES6Promise
  ...(省略代码)

  catch(onRejected) { // 仅需执行 this.then(null, onRejected) 并返回结果即可 
    return this.then(null, onRejected);
  };
};
```

### 1.2 `Promise.prototype.finally()`

`finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作，和 `try……catch……finally` 中的 `finally` 功能是一致的。该方法是 ES2018 引入标准的。

- `finally()` 方法接收 `onFinally` 函数作为参数， 并且 `onFinally` 函数不接受任何参数，这意味着无法知道 promise 是解决还是拒绝。也说明，`finally` 方法里面的操作，与状态无关的，不依赖于 promise 的执行结果。
- promise 无论执行结果是解决还是拒绝，`finally()` 方法中的 `onFinally` 函数都会执行，且一定是在  promise 已解决或已拒绝后执行（执行时机与 `onFulfilled` 或 `onRejected`  执行时机一致）
- `finally()` 方法返回一个新的 promise，返回的 promise 的状态完全依赖于前一个 promise 的状态，即前一个 promise 为解决，`finally()` 方法返回的状态仍然为解决，拒绝同理。 

`finally` 本质上其实是 `then` 方法的特例，即：

```javascript
promise.finally(() => { 
  // onFinally 执行逻辑 
});

// 等同于
promise.then(value => {
    // onFinally 执行逻辑
    return value;
  },
  reason => {
    // onFinally 执行逻辑
    throw reason;
  }
);
```

实现的代码如下：

```js
// 02-Promise.prototype.finally
...(省略代码)

class ES6Promise {
  ...(省略代码)

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
};
```

## 2. 七个静态方法

### 2.1 `Promise.resolve()`

`Promise.resolve()` 可以实例化一个已解决的 promise，它完全等价于`new Promise(resolve => resolve())`。

```javascript
Promise.resolve('foo');
// 等价于
new Promise(resolve => resolve('foo'));
```

因此，实现的方法也很简单，只是需要注意一点， ES6 中为 class 对象添加静态方法是直接在方法名称前加上 `static` 关键字，如下：

```js
// 03-Promise.resolve
...(省略代码)

class ES6Promise {
  ...(省略代码)

  static resolve(arg) {
    return new ES6Promise(resolve => resolve(arg));
  };
};
```

### 2.2 `Promise.reject()`

`Promise.reject()` 可以实例化一个已拒绝的 promise，与 `Promise.resolve()` 同理，它完全等价于`new Promise((_, reject) => reject())`。

实现如下：

```js
// 04-Promise.reject
...(省略代码)

class ES6Promise {
  ...(省略代码)

  static reject(arg) {
    return new ES6Promise((_, reject) => reject(arg));
  };
};
```

### 2.3 `Promise.all()`

`Promise.all()` 方法用于将多个 Promise 实例，包装成一个新的 promise 实例。

```js
const p = Promise.all([p1, p2, p3]);
```

上面代码中，`Promise.all()` 方法接受一个数组作为参数，`p1`、`p2`、`p3` 都是 promise 实例，**如果不是，就会先调用 `Promise.resolve()` 方法**，将参数转为 promise 实例，再进一步处理。另外，`Promise.all()` 方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 promise 实例（本文仅限制接收的参数必须为数组，实际上只要是可迭代对象均可作为参数）。

`p` 的状态由 `p1`、`p2`、`p3` 决定，分成两种情况。

- 只有 `p1`、`p2`、`p3` 都成功解决后，`p   `才会被解决，此时 `p1`、`p2`、`p3 `的返回值将组成一个数组，传递给 `p` 的回调函数。

- 只要 `p1`、`p2`、`p3` 之中有一个被拒绝，`p` 就会立马被拒绝，此时第一个被拒绝的实例的返回值，会传递给 `p` 的回调函数。

因此，实现的过程如下，设 `Promise.all()` 方法返回的 promise 实例名为 `promiseAll`：

1. 传入的参数必须为数组，否者抛出错误（实际上只要是可迭代对象均可作为参数）
2. 传入的参数的成员需要是 promise 实例，**处理办法其实很简单，无需判断，直接所有的成员都先调用 `Promise.resolve()` 方法，无论原本是否为 promise 实例，处理后自然满足条件。**
3.  `Promise.all()` 返回一个新的 promise 实例 `promiseAll` 
4. 利用**发布订阅的机制**实现 `Promise.all()` 的主要逻辑（此处利用 [pubsub-js](https://www.npmjs.com/package/pubsub-js)来实现，之后我也会分享手写发布订阅机制）
   - 订阅一个事件 `getPromiseResult` 用于收集 promise 实例的执行顺序和结果
   - 在 promise 实例的 `then` 方法中发布 `getPromiseResult` 事件并传递执行的顺序和结果
   - 当有任意一个实例返回了成功拒绝的结果时，立即以此实例的拒因拒绝 `promiseAll`
   - 当所有的实例都返回成功解决结果时，立即以所有实例解决的值组成的数组为终值解决 `promiseAll`
5. 同时执行所有的 promise 实例

实现代码如下：

```js
// 05-Promise.all
const PubSub = require('pubsub-js');
...(省略代码)

class ES6Promise {
  ...(省略代码)

  static all(promises) {
    if (!Array.isArray(promises)) { // 检查是否为数组，否则抛出 TypeError 错误
      throw TypeError(`${promises} is not iterable`);
    };

    return new ES6Promise((resolve, reject) => {
      const res = []; // 保存实例执行的结果
      let l = promises.length;
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
};
```

### 2.4 `Promise.race()`

`Promise.race() `方法同样是将多个 promise 实例，包装成一个新的 promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要 `p1`、`p2`、`p3 `之中有一个实例率先解决或拒绝，`p ` 就会立即解决或拒绝，并且那个率先解决或拒绝的 promise 实例的返回值，会传递给 `p` 的回调函数。

`Promise.race() ` 方法与 `Promise.all() ` 除了在最终返回 promise 结果的机制上不同外，其它均相同。因此，实现的步骤主要发布订阅时处理的逻辑不同，下面仅描述利用**发布订阅的机制**实现 `Promise.race()` 的主要逻辑其它步骤与 `Promise.all() ` 完全相同，如下：

- 订阅一个事件 `getPromiseResult` 用于收集 promise 实例的执行结果
- 在 promise 实例的 `then` 方法中发布 `getPromiseResult` 事件并传递执行的结果
- 当有任意一个实例返回了解决/拒绝的结果时，立即以此实例的终值/拒因来解决/拒绝 `promiseAll`；

```js
// 06-Promise.race
...(省略代码)

class ES6Promise {
  ...(省略代码)

  static race(promises) {
    if (!Array.isArray(promises)) {
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
};
```

### 2.5 `Promise.allSettled()`

### 2.6 `Promise.any()` 

### 2.7 `Promise.try()`

