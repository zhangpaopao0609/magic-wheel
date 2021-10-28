[toc]

# 手写轮子系列二 —— 手写完整版 ES6 Promise 

在阅读本文前请务必已阅读 [手写轮子系列一 —— 手写 Promise](https://blog.csdn.net/qq_41800366/article/details/120830777?spm=1001.2014.3001.5502) 一文，此文参照 Promises/A+ 规范完整地实现了 Promise 对象，本文是在**此基础上实现 ES6 Promise 额外的内容**。

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

`finally()`方法用于指定不管 promise 实例最后状态如何，都会执行的操作，和 `try……catch……finally` 中的 `finally` 功能是一致的。该方法是 ES2018 引入标准的。

- `finally()` 方法接收 `onFinally` 函数作为参数， 并且 `onFinally` 函数不接受任何参数，这意味着无法知道 promise 实例是解决还是拒绝。也说明，`finally` 方法里面的操作，与状态无关的，不依赖于 promise 的执行结果
- promise 无论执行结果是解决还是拒绝，`finally()` 方法中的 `onFinally` 函数都会执行，且一定是在  promise 实例已解决或已拒绝后执行（执行时机与 `onFulfilled` 或 `onRejected`  执行时机一致）
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

`Promise.resolve()` 可以实例化一个 promise，这个方法可接收一个参数，根据参数不同，实例化的 promise 也不相同

1. 参数是一个 promise 实例

   如果参数是 promise 实例，那么 `Promise.resolve` 将不做任何修改、原封不动地返回这个实例。

2. 参数是一个 `thenable` 对象

   `thenable` 对象指的是具有 `then` 方法的对象，比如下面这个对象。

   ```javascript
   let thenable = {
     then: function(resolve, reject) {
       resolve(42);
     }
   };
   ```

   `Promise.resolve() `方法会将这个对象转为 Promise 对象，然后就立即执行 `thenable` 对象的 `then()` 方法。

   ```javascript
   let thenable = {
     then: function(resolve, reject) {
       resolve(42);
     }
   };
   
   let p1 = Promise.resolve(thenable);
   p1.then(function (value) {
     console.log(value);  // 42
   });
   ```

   上面代码中，`thenable  ` 对象的 `then()` 方法执行后，对象 `p1` ，即返回的 promise 实例的状态就变为 `resolved`，从而立即执行最后那个 `then()` 方法指定的回调函数，输出42。

3. 参数不是具有`then()`方法的对象，或根本就不是对象

   如果参数是一个原始值，或者是一个不具有 `then()` 方法的对象，则 `Promise.resolve()` 方法返回一个新的 Promise 对象，状态为 `resolved`。

   ```javascript
   const p = Promise.resolve('Hello');
   
   p.then(function (s) {
     console.log(s)
   });
   // Hello
   ```

   上面代码生成一个新的 Promise 对象的实例 `p`。由于字符串 `Hello` 不属于异步操作（判断方法是字符串对象不具有 then 方法），返回 Promise 实例的状态从一生成就是 `resolved`，所以回调函数会立即执行。`Promise.resolve()` 方法的参数，会同时传给回调函数。

4. 不带有任何参数

   `Promise.resolve()` 方法允许调用时不带参数，直接返回一个 `resolved` 状态的 promise 实例。

因此，实现的方法也很简单：

-  ES6 中为 class 对象添加静态方法是直接在方法名称前加上 `static` 关键字，因此使用 `static resolve` 定义静态方法

- 上面 4 点完全和 [手写轮子系列一 —— 手写 Promise](https://blog.csdn.net/qq_41800366/article/details/120830777?spm=1001.2014.3001.5502) 一文中的 Promise 解决过程  `resolvePromise` 完全一致，因此仅需要返回一个新的 promise 并且在执行函数中执行 Promise 解决过程即可。

  > 这里可能不是很好理解，但是只要你仔细看过上一篇文章，那么这里应该没什么问题

  ```js
  // 03-Promise.resolve
  ...(省略代码)
  function resolvePromise(promise, x, resolve, reject) {
    ...(省略代码)
  }
  
  class ES6Promise {
    ...(省略代码)
  
    static resolve(arg) {
      return new ES6Promise((resolve, reject) => {
        resolvePromise(null, arg, resolve, reject);
      });
    };
  };
  ```

### 2.2 `Promise.reject()`

`Promise.reject()` 也可以实例化一个 promise ，同样可接收一个参数，和  `Promise.resolve()` 不同的是  `Promise.reject()`  返回的一定是一个已拒绝的 promise， 并且方法的参数会**原封不动地**作为 `reject` 的理由，变成后续方法的参数。

它完全等价于 `new Promise((_, reject) => reject())`。

因此实现如下：

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

有时候，我们希望等到一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。但是，现有的 Promise 方法很难实现这个要求。

`Promise.all()` 方法只适合所有异步操作都成功的情况，如果有一个操作失败，就无法满足要求。

为了解决这个问题，[ES2020](https://github.com/tc39/proposal-promise-allSettled) 引入了 `Promise.allSettled() `方法，用来确定一组异步操作是否都结束了（不管成功或失败）。所以，它的名字叫做 `Settled`，包含了 `fulfilled` 和 `rejected` 两种情况。

`Promise.allSettled()` 方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有  Promise  对象都发生状态变更（不管是 `fulfilled` 还是 `rejected`），返回的 Promise 对象才会发生状态变更。

该方法返回新的 promise 实例，一旦发生状态变更，状态总是 `fulfilled` ，不会变成`rejected`， 即返回的 promise 实例一定是被解决的状态。状态变成 `fulfilled` 后，它的回调函数会接收到一个数组作为参数，该数组的每个成员对应前面数组的每个 Promise 对象。

```js
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(results => console.log(results));
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]
```

上面代码中，`Promise.allSettled()` 的返回值 `allSettledPromise`，状态只可能变成 `fulfilled`。它的回调函数接收到的参数是数组`results`。该数组的每个成员都是一个对象，对应传入 `Promise.allSettled()` 的数组里面的两个 Promise 对象。

`results` 的每个成员是一个对象，对象的格式是固定的，对应异步操作的结果。

```javascript
// promise 解决时
{status: 'fulfilled', value: value}  // value 为解决的值
// promise 拒绝时
{status: 'rejected', reason: reason}	// reason 为拒绝的原因
```

实现上与 `Promise.all()` 有绝大部分相同，但是更加简单， `Promise.all()`  需要做特殊的处理（当成员拒绝时，需要立即拒绝要返回的新的 promise），但是 `Promise.allSettled()`  不用，全部执行并收集结果即可，然后以此结果为值解决要返回的新的 promise，设此 promise 名为：  `promiseAllSettled`

- 订阅一个事件 `getPromiseResult` 用于收集 promise 实例的执行结果
- 在 promise 实例的 `then` 方法中发布 `getPromiseResult` 事件并传递执行的结果，并且按照传入的顺序来收集执行的结果，使用数组收集。
- 当有所有实例均返回结果后，立即以收集到的结果（数组）为值来解决 `promiseAllSettled`；

实现代码如下：

```js
//  07-Promise.allSettled
...(省略代码)

class ES6Promise {
  ...(省略代码)

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
};
```

### 2.6 `Promise.any()` 

ES2021 引入了 [`Promise.any()`方法](https://github.com/tc39/proposal-promise-any)。该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。

只要参数实例有一个变成 `fulfilled `状态，包装实例就会变成  `fulfilled` 状态；如果所有参数实例都变成`rejected`状态，包装实例就会变成 `rejected `状态。这个方法其实就是 `Promise.all()` 方法的反例，因此实现代码如下：

```js
//  08-Promise.any
...(省略代码)

class ES6Promise {
  ...(省略代码)

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
};
```

### 2.7 `Promise.try()`

实际开发中，经常遇到一种情况：不知道或者不想区分，函数 `f` 是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管 `f` 是否包含异步操作，都用 `then` 方法指定下一步流程，用 `catch` 方法处理 `f` 抛出的错误。一般就会采用下面的写法。

```js
Promise.resolve().then(f)
```

上面的写法有一个缺点，就是如果 `f` 是同步函数，那么它会在本轮事件循环的末尾执行。

```javascript
const f = () => console.log('now');
Promise.resolve().then(f);
console.log('next');
// next
// now
```

上面代码中，函数 `f` 是同步的，但是用 Promise 包装了以后，就变成异步执行了。

那么有没有一种方法，让同步函数同步执行，异步函数异步执行，并且让它们具有统一的 API 呢？回答是可以的，并且还有两种写法。第一种写法是用 `async` 函数来写。

```javascript
const f = () => console.log('now');
(async () => f())();
console.log('next');
// now
// next
```

上面代码中，第二行是一个立即执行的匿名函数，会立即执行里面的 `async` 函数，因此如果 `f` 是同步的，就会得到同步的结果；如果 `f` 是异步的，就可以用 `then` 指定下一步，就像下面的写法。

```javascript
(async () => f())()
.then(...)
```

需要注意的是，`async () => f() `会吃掉 `f()` 抛出的错误。所以，如果想捕获错误，要使用 `promise.catch` 方法。

```javascript
(async () => f())()
.then(...)
.catch(...)
```

第二种写法是使用 `new Promise()`。

```javascript
const f = () => console.log('now');
(
  () => new Promise(
    resolve => resolve(f())
  )
)();
console.log('next');
// now
// next
```

上面代码也是使用立即执行的匿名函数，执行 `new Promise()`。这种情况下，同步函数也是同步执行的。

鉴于这是一个很常见的需求，所以现在有一个 [提案](https://github.com/ljharb/proposal-promise-try)，提供 `Promise.try` 方法替代上面的写法。

```javascript
const f = () => console.log('now');
Promise.try(f);
console.log('next');
// now
// next
```

目前还处于提案阶段，因此，最终是否会成为标准并不确定。本文在这里仅说明其基本思想以及简单的实现方法：

- 传入的参数必须为函数，否者抛出错误
- 返回一个新的 promise 并且立即以**传入的函数的调用结果为值**解决此 promise （也就是上述的第二种写法）

```js
//  09-Promise.try
...(省略代码)

class ES6Promise {
  ...(省略代码)

  static try(tryFn) {
    if (typeof tryFn === 'function') {
      throw TypeError("It is not function!!");
    };

    return new ES6Promise(resolve => resolve(tryFn()))
  };
};
```

## 3. 总结

相比较 Promises/A+ 规范的 Promise 对象，ES6 更多的是提供了大量的便捷方法，所以在实现上也只是 Promise 基础方法的组合，也就是在应用层面做的提升，所以整体实现并没有太大的难度。

注意： 本文仅提供 ES6 Promise 的实现思路，因为目前并未发现类似  [promises-tests](https://github.com/promises-aplus/promises-tests) 这样的测试仓库（这个仓库提供了基于 Promises/A+ 规范实现的 Promise 测试方法），因此并未做全面的测试，所以是否完全正确有待测试。

本文所有的代码可在此仓库中查看，[点击可查看](https://github.com/Ardor-Zhang/magic-wheel/tree/main/01-promise-es6/src/implementation-steps)。

