

[toc]



# Promises/A+规范（中文翻译）



**一个开放的、健全的且通用的 JavaScript Promises 标准——由开发者制定，供开发者参考实现 Promises。**

> 译文术语：
>
> - 解决（fulfilled, 有时候也称兑现）: 指一个 promise 成功地从 “待定” 状态进入 “兑现” 状态。虽然规范中使用 `fulfill` 来表示解决，但一般多以 `resolve` 来指代。
> - 拒绝（reject）：指一个 promise 成功地从 “待定” 状态进入 “拒绝” 状态。
> - 终值（eventual value）：指一个 promise 解决时传递给解决回调的值，由于 promise 有**一次性**的特征，因此当这个值被传递时，标志着 promise 等待态的结束，故称之终值，有时也直接简称为值（value）。
> - 拒因（reason）：指一个 promise 拒绝时传递给拒绝回调的值（原因），

Promise  表示一个异步操作的最终结果，与之进行交互的方式主要是 `then` 方法，该方法接收两个回调函数，用于接收 promise 解决后的值或者拒绝的原因。

本规范详细列出了 `then` 方法的执行过程，所有遵循 Promises/A+ 规范实现的 promise 均可以本规范作为标准来实现 `then` 方法。正因如此，本规范将会非常稳定，即便 Promises/A+ 组织可能会为了处理一些特殊的边界情况而修订本规范，改动都会非常的小并且保证是向下兼容的。如果要进行大规模或者不向下兼容的改动，一定会进行谨慎的考虑、详尽的探讨以及完善的测试。

从发展历程来看，本规范实际上是把早期的 [Promises/A 提案](http://wiki.commonjs.org/wiki/Promises/A) 的建议明确成了行为标准：一方面扩展了原有提案约定俗成的行为，一方面删减了原有提案的一些特殊情况和有问题的部分。

最后，Promises/A+ 规范的核心并不是如何创建、解决和拒绝 promise，而是专注于提供一个通用的 `then` 方法。上述关于 promise 的操作方法将来可能会在其它规范中提及。

## 1. 术语

1. "promise"：是一个拥有 `then` 方法的对象或者函数，其行为符合本规范，红宝书4 上译为“期约”，本文保留英文
2. "thenable"：是一个定义了 `then` 方法的对象或者函数，文中译为 "拥有 `then` 方法"
3. "value"：指任何 JavaScript 的合法值（包括 `undefined`， "thenable" 和 "promise"），文中译为 “值”
4. "exception"：指使用 `throw` 语句抛出的一个值，文中译为 "异常"
5. "reason"：指一个 promise 的拒绝原因，文中译为 “拒因”

## 2. 必要条件

### 2.1  Promise 的状态

一个 promise 所处的状态必须为以下三者之一：待定（pending）,兑现（fulfilled，有时候也称为 “解决”，resolved），拒绝（rejected）

1. 当处于待定状态时：
   1. 可以流转为代表成功的兑现状态，或者代表失败的拒绝状态。
2. 当处于兑现状态时：
   1. 不可流转到其它任何状态
   2. 必须拥有一个不可变的终值
3. 当处于拒绝状态时：
   1. 不可流转到其它任何状态
   2. 必须拥有一个不可变的拒因

这里的不可变指的是恒等（可用 `===` 判断相等），而不是意味着更深层次的不可变（**译者注**： 指当 value 或 reason 不是基本值时，只要求其引用地址不变，但其内部的属性值可以更改的）。

### 2.2 Then 方法

一个 promise 必须提供一个 `then` 方法以访问其当前值或者终值或者拒因。

promise 的 `then` 方法接收两个参数：

```js
promise.then(onFulfilled, onRejected)
```

1. `onFulfilled` 和 `onRejected` 都是可选参数：

   1. 如果 `onFulfilled` 不是函数，必须将其忽略
   2. 如果 `onRejected` 不是函数，必须将其忽略

2. 如果 `onFulfilled` 是函数：

   1. 当 `promise` 解决后其必须被调用，其第一个参数为 `promise` 的终值
   2. 在 `promise` 解决前其不可被调用
   3. 其调用次数不可超过一次

3. 如果 `onRejected` 是函数：

   1. 当 `promise` 拒绝后其必须被调用，其第一个参数为 `promise` 的拒因
   2. 在 `promise` 拒绝前其不可被调用
   3. 其调用次数不可超过一次

4. 调用时机

   1. `onFulfilled` 和 `onRejected` 只有在[执行环境](http://es5.github.io/#x10.3)堆栈仅包含**平台代码**时才可被调用 <sup>[注1](#note-1)</sup>

      > **译者注：**promise 解决或者拒绝后 `then` 方法的回调并不是立即调用的，而是放到的任务队列中，具体何时执行需要根据实现的机制来。

5. 调用要求

   1. `onFulfilled` 和 `onRejected` 必须被作为函数调用（换句话说就是：没有 `this` 值）<sup>[注2](#note-2)</sup>

      > **译者注：**原文在这里的直译有些难理解，可以理解为`onFulfilled` 和 `onRejected`  是在严格模式在执行的（还存在疑问），请查看注释。

6. `then` 方法可以被同一个 `promise` 调用多次

   1. 当 `promise` 解决后，所有的 `onFulfilled` 需按照其注册顺序依次回调
   2. 当 `promise` 拒绝后，所有的 `onRejected` 需按照其注册顺序依次回调

7. `then` 方法必须返回一个 `promise` 对象<sup> [注3](#note-3)</sup>

   ```js
   promise2 = promise1.then(onFulfilled, onRejected)
   ```

   1. 如果 `onFulfilled` 或者 `onRejected` 为函数且返回一个值 `x` ，则运行 **Promise 解决过程**：`[[Resolve]](promise2, x)`

      > **译者注：**“**Promise 解决过程**：`[[Resolve]](promise2, x)` ” 是指一个抽象的执行过程，这里可以直接理解成一个函数，2.3 会详细说明

   2. 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e` ，则 `promise2` 必须拒绝并返回拒因 `e`

   3. 如果 `onFulfilled` 不是函数且 `promise1` 已解决， `promise2` 必须解决并返回与 `promise1` 相同的值

   4. 如果 `onRejected` 不是函数且 `promise1` 已拒绝， `promise2` 必须拒绝并返回与 `promise1` 相同的拒因


### 2.3 Promise 解决过程

Promise 解决过程是一个抽象的操作，其需要一个 promise 和 value 作为输入，将其表示为 `[[Resolve]](promise2, x)`，如果 `x` 拥有 `then` 方法且看上去像一个 promise，解决程序即尝试使 `promise2` 接受 `x` 的状态；否则直接用 `x` 值来解决 `promise2`。

> **译者注：**
>
> 1. 原文的 `[[Resolve]](promise, x)`是直接写的 `promise`，这里为了让读者更直观的理解将 `promise` 改成 `promise2`，如此更加清晰地明白后文中解决或拒绝的 `promise` 是哪一个
> 2. 这里以及下文提到的 `x` 是指 `promise1` 的 `then` 方法中的 `onFulfilled` 或者 `onRejected` 函数返回的值 

这种 *thenable* 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promise/A+ 协议的 `then` 方法即可；这同时也使遵循 Promises/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存。

执行 `[[Resolve]](promise2, x)` 需遵循以下步骤：

1. `x` 与 `promise2` 相等
   
   1. 如果 `promise2` 和 `x` 指向同一对象，以 `TypeError` 为拒因拒绝 `promise2`
2. 如果 `x` 为 Promise，依据状态不同<sup>[注4](#note-4)</sup>：
   1. 如果 `x` 处于待定状态， `promise2` 需保持为待定状态直至  `x`  被解决或拒绝
   2. 如果 `x` 处于兑现状态，用与 `x` 相同的终值解决 `promise2`
   3. 如果 `x` 处于拒绝状态，用与 `x` 相同的拒因拒绝 `promise2`
3. 如果 `x` 是一个对象或者函数
   1. 把 `x.then` 赋值给 `then` <sup>[注5](#note-5)</sup>
   2. 如果取 `x.then` 的值时抛出错误 `e` ，则以 `e` 为拒因拒绝 `promise2`
   3. 如果 `then` 是函数，将 `x` 作为函数的作用域 `this` 调用之。传递两个回调函数作为参数，第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`:
      1. 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise2, y)`
      
      2. 如果 `rejectPromise` 以拒因 `r` 为参数被调用，则以拒因 `r` 拒绝 `promise2`
      
      3. 如果 `resolvePromise` 和 `rejectPromise` 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      
         > **译者注：** 这里主要是为了更好的契合 `then` 方法中 `onFulfilled` 和 `onRejected`  仅会执行其中一个和仅执行一次
      
      4. 如果调用 `then` 方法抛出了异常 `e`：
         1. 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略之
         2. 否则以 `e` 为拒因拒绝 `promise2`
   4. 如果 `then` 不是函数，以 `x` 为参数解决 `promise2`
4. 如果 `x` 不为对象或者函数，以 `x` 为参数解决 `promise2`

如果一个 promise 被一个循环的 *thenable* 链中的对象解决，而 `[[Resolve]](promise2, thenable)` 的递归性质又使得其被再次调用，根据上述的算法这个 promise 将会陷入无限递归之中。算法虽不强制要求，但也鼓励实现者检测这样的递归是否存在，若检测到存在则以一个可识别的 `TypeError` 为拒因来拒绝 `promise2` <sup>[注6](#note-6)</sup>。

## 3. 注释

**<span id="note-1">1. 注1</span>**

这里的平台代码指的是引擎、环境以及 promise 的执行代码。实践中要确保 `onFulfilled` 和 `onRejected` 函数异步地执行，并且应该是在 `then` 方法被调用后的新一轮事件循环的新执行栈中执行。这个机制可以采用 "宏任务（macro-task）"机制来实现，比如： `setTimeout` 或 `setImmediate`；也可以采用 "微任务（micro-task）" 机制来实现，比如 `MutationObserver` 或者 `process.nextTick` 。由于 promise 的实施代码本身就是平台代码（**译者注：** 即都是 JavaScript），故代码自身在处理在处理程序时可能已经包含一个任务调度队列或[跳板](https://en.wikipedia.org/wiki/Trampoline_(computing))。

> **译者注：** 这里提及了 macrotask 和 microtask 两个概念，这表示异步任务的两种分类。在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 macrotask 的队列（这个队列也被叫做 task queue）中取出第一个任务，执行完毕后取出 microtask 队列中的所有任务顺序执行；之后再取 macrotask 任务，周而复始，直至两个队列的任务都取完。
>
>  两个类别的具体分类如下：
>
> - **macro-task:** script（整体代码）, `setTimeout`, `setInterval`, `setImmediate`, I/O, UI rendering
>
> - **micro-task:** `process.nextTick`, `Promises`（这里指浏览器实现的原生 Promise）, `Object.observe`, `MutationObserver`
>
>     详见 [stackoverflow 解答](http://stackoverflow.com/questions/25915634/difference-between-microtask-and-macrotask-within-an-event-loop-context) 

**<span id="note-2">2. 注2</span>**

也就是说在 **严格模式（strict）** 中，函数 `this` 的值为 `undefined` ；在非严格模式中其为全局对象。

**<span id="note-3">3. 注3</span>**

promise 的实现在满足其它所有要求的情况下可以允许 `promise2 === promise1` ，但要求每个实现都要文档说明其是否允许以及在何种条件下允许 `promise2 === promise1` 。

**<span id="note-4">4. 注4</span>**

总体来说，如果 `x` 符合当前实现，我们才认为它是真正的 *promise* 。这一规则允许那些特例实现接受符合已知要求的 Promises 状态。

**<span id="note-5">5. 注5</span>**

这步先是存储了一个指向 `x.then` 的引用，然后测试并调用该引用，以避免多次访问 `x.then` 属性。这种预防措施确保了该属性的一致性，因为其值可能在检索调用时被改变。

**<span id="note-6">6. 注6</span>**

实现不应该对 *thenable* 链的深度设限以及假定超出限制的递归就是无限循环。只有真正的循环递归才应能导致 `TypeError` 异常；如果一条无限长的链上 *thenable* 均不相同，那么递归下去永远是正确的行为。

## 4. 参考

1. 原文：[Promises/A+](https://promisesaplus.com/)
2. 参考翻译：[Promise A+ 规范](http://malcolmyu.github.io/malnote/2015/06/12/Promises-A-Plus/)