[toc]

# 一起来实现属于你的 call()、apply()、bind() 吧

在工作中重复造轮子纯粹是浪费生命，但为了学习而尝试造一些 mini 版的轮子也是非常有意义的，而且全面的模拟常用的轮子还可以加深你对这些轮子的理解。

今天，就让我们一起来探索一番 JS 中 `call`， `apply` 以及 `bind` 是如何实现的，然后造出属于我们自己的 `call`， `apply` 以及 `bind` 吧！！

## 1. `call`

### 1.1  `call` 方法

首先，让我们来回顾一下 `call` 的基本语法和作用，详细可见 [Function.prototype.call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)。

```js
function.call(thisArg, arg1, arg2, ...)
```

参数

- `thisArg`

  可选参数。`function` 在执行时函数内部的 `this` 值。注意：在某些情况下函数内部的 `this` 值并不指向传递的 `thisArg`：在[非严格模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)下，如果 `thisArg` 为 `null` 或者 `undefined`，将会替换成全局对象；如果 `thisArg` 为原始值，将会自动为其包装一个封装对象。

- `arg1, arg2, ...`

通俗的理解就是：`function.call(thisArg, ...)` 方法<font color='red'>**显示地**</font>将函数内部的 `this` 指向了 `thisArg`。

### 1.2 探究和实现 `call` 方法

### 1.2.1 探究

`call` 方法的使用示例：

```js
const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
};

showUserName('hello:'); // hello: undefined
showUserName.call(user, 'hello:');  // hello: 张跑跑
```

上述示例直接调用 `showUserName('hello:')`，将打印出 `hello: undefined`，因为此时函数的 `this` 指向的是全局对象，全局对象上并没有 `name` 属性；通过 `call` 调用  `showUserName.call(user, 'hello:');`，将打印出 `hello: 张跑跑`，因为此时函数的 `this` 不再指向全局对象了，而是被 `call` 方法显示地指向了 `user` 对象。

因此，如果我们从上述示例分析 `call` 方法的基本原理，细细分析，将可以得到以下这些思想点：

1. 调用 `call` 方法将显示指定函数的 `this` 指向，如上述示例，<font color='red'>似乎可以认为 `showUserName.call(user, 'hello:')` 变成了 `user.showUserName('hello:')`</font>（这里非常关键，是实现 `call` 的最关键处）。

   > `user.showUserName()` 属于隐式的 `this` 绑定，调用时 `this` 会指向 `user`

2. 调用 `showUserName.call(user, arg1, arg2, ...)` 时传递的参数 `arg1, arg2...`，调用时都应以相同的等形式传递给原始的 `showUserName(arg1, arg2, ...)`

3. 不会对 `user` 和 `showUserName` 造成任何的副作用，即调用不会以任何方式修改原始的  `user` 和 `showUserName` 

### 1.2.2 基础实现

让我们试着实现 `call` 思想的第一步。

1. 首先， `call` 方法作为 `Function` 对象原型上的方法，同样，我们自己的 `myCall ` 方法也需要定义在 `Funtion.prototype` 上
2. 如 1.2.1 中 1所述，`call` 方法可以转换成对应形式的隐式 `this` 绑定

因此，基本实现如下：

```js
```



作为函数对象的调用方法原型方法。我们的自定义myOwnCall也将附加到函数原型。









































































