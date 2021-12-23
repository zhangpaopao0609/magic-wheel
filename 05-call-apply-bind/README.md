[toc]

# 一起来实现属于你的 call()、apply()、bind() 吧

在工作中重复造轮子纯粹是浪费生命，但为了学习而尝试造一些 mini 版的轮子也是非常有意义的，而且全面的模拟常用的轮子还可以加深你对这些轮子的理解。

今天，就让我们一起来探索一番 JS 中 `call`， `apply` 以及 `bind` 是如何实现的，然后造出属于我们自己的 `call`， `apply` 以及 `bind` 吧！！

## 1. 函数 this 的隐式绑定

## 2. call

### 2.1  `call` 方法

首先，让我们来回顾一下 `call` 的基本语法和作用，详细可见 [Function.prototype.call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)。

```js
function.call(thisArg, arg1, arg2, ...)
```

参数：

- `thisArg`

  可选参数。`function` 在执行时函数内部的 `this` 值。注意：在某些情况下函数内部的 `this` 值并不指向传递的 `thisArg`：在[非严格模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)下，如果 `thisArg` 为 `null` 或者 `undefined`，将会替换成全局对象；如果 `thisArg` 为原始值，将会自动为其包装一个封装对象。

- `arg1, arg2, ...`

`function.call(thisArg, ...)` 需要注意的是：

1. `function` 函数将会 <font color='red'>立即执行</font>
2. 在执行时，会 <font color='red'>**显示地**</font> 将函数内部的 `this` 指向了 `thisArg`
3. 除 `thisArg` 外的所有剩余参数将全部传递给 `function` 

### 2.2 探究和实现 `call` 方法

#### 2.2.1 探究

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

> 如果没有完全理解到这三点，不用着急，往下看，我们一点点的来剖析

#### 2.2.2 基础实现

让我们试着实现 `call` 思想的第一步。

1. 首先， `call` 方法作为 `Function` 对象原型上的方法，同样，我们自己的 `myCall ` 方法也需要定义在 `Funtion.prototype` 上
2. 如 1.2.1 中 1所述，`call` 方法可以转换成对应形式的隐式 `this` 绑定

因此，基本实现如下：

```js
Function.prototype.myCall = function(thisArg) {
  thisArg.fnName = this;
  thisArg.fnName();
};
```

让我们来好好分析分析上面这三行代码，以执行下面代码为例：

```js
const user = { name: '张跑跑' };

function showUserName() {
  console.log(this.name);
};

showUserName.myCall(user);
```

1. `Function.prototype.myCall = function(thisArg) {};`

   - 在 `Function.prototype` 对象上定义一个属性 `myCall`，值为可调用的函数且接收要指向的对象

   - 因为是定义在 `Function.prototype` 对象上，因此只要是在函数上调用`myCall` 方法，即 `function.myCall` ，就能够<font color='red'>通过委托（也就是原型链）</font>最终就能找到这一方法（这也是为什么要定义在 `Function.prototype` 对象上的原因）

2. `thisArg.fnName = this;`

   这里共有两处有意思的地方，我们一一来聊聊

   - `this`， 这里的这个 `this` 指向什么？

     答案是：此处的 `this` 指向的是调用 `myCall` 方法的那个函数，例如 `showUserName.myCall(user)`，此处的 `this` 就是 `showUserName` 函数。

     原因很简单，<font color='red'>`this` 的隐式绑定</font>。

   - `thisArg.fnName = this` 执行后 `thisArg.fnName` 是啥 ？

     由上一点可知，此处的 `this` 指向了 `showUserName` 函数，那么当程序执行 `thisArg.fnName = this` 时，实际上赋值给 `thisArg.fnName` 的<font color='red'>是 `this` 指向的函数的函数体内容</font>，即：

     ```js
     // thisArg 对象
     {
       fnName: function() { console.log(this.name)}
     }
     ```

3. `thisArg.fnName();`

   执行时因为 `fnName` 这个属性值为函数，因此又<font color='red'>发生了 `this` 的隐式绑定</font>，即 `fnName` 这个属性对应的值 `function() { console.log(this.name)}` 在执行时函数体的 `this` 指向了 `thisArg`

至此，相信你已经知道 `showUserName.myCall(user);` 这行代码执行后的结果了：`张跑跑`。

#### 2.2.3 参数传递

如果现在是 ES6 版本前，想要在此实现参数的传递，将会有些难度和工作量，但是 ES6 为我们提供了两个非常棒的新特性：

- rest 参数（形式为 `...变量名`），用于获取函数的多余参数，rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。
- 扩展运算符 `...`， 它好比 rest 参数的逆运算，将一个数组转为用逗号分隔的参数序列。

如此，实现这个功能将会很简单，[点击查看](https://es6.ruanyifeng.com/#docs/function#rest-%E5%8F%82%E6%95%B0) rest 参数、[点击查看](https://es6.ruanyifeng.com/#docs/array#%E6%89%A9%E5%B1%95%E8%BF%90%E7%AE%97%E7%AC%A6) 扩展运算符的更多内容。

先来看看实现：

```js
Function.prototype.myCall = function(thisArg, ...args) {
  thisArg.fnName = this;
  thisArg.fnName(...args);
};
```

没错，就是这么简单

1. 通过 rest 参数收集到函数调用时的所有剩余参数

   此时的 `args` 是一个收集了函数调用时所有剩余参数的数组

2. 通过扩展运算符将参数进行传递

   `thisArg.fnName(...args);` 中 `args` 是一个数组，通过扩展运算符将 `args` 转化为用逗号分隔的参数传递给 `thisArg.fnName`

#### 2.2.4 去除副作用

实现过程中我们为 `thisArg` 这个对象添加了一个属性 `fnName`，那么函数（被显示绑定 `this` 的函数，即 `showUserName` 函数）执行完成后，需要删除掉 `fnName` 属性

```js
Function.prototype.myCall = function(thisArg, ...args) {
  thisArg.fnName = this;
  thisArg.fnName(...args);
  delete thisArg.fnName;
};
```

#### 2.2.5 优化

在 `myCall` 方法中，还有一些显而易见的优化点，在此做一些简单的处理：

1. 保证 `fnName` 的唯一性

   因为 `thisArg` 中可能存在 `fnName` 这个属性，因此，需要避免这样的情况出现，需要一个唯一的属性名。

   在 ES6 之前，我们可能需要使用 uuid 才能实现这个功能，但是 ES6 为我们提供了一个新的原始数据类型 `Symbol` ，表示独一无二的值。

   ```js
   Function.prototype.myCall = function(thisArg, ...args) {
     const fnName = Symbol();	// 将是独一无二的值
     thisArg[fnName] = this;
     thisArg[fnName](...args);
     delete thisArg[fnName];
   };
   ```

2. 非严格模式下处理

   

至此，`myCall` 就基本实现了，但并不算完整，因为还有很多的边界条件未处理，比如严格模式和非严格模式下 `thisArg` 为不同值时进行不同的处理，但就学习而言，已经够够的啦！！

## 3. apply

从使用上来说， `apply()` 和 `call` 非常的相似，仅有一点区别：

- 使用  `apply` ，仅支持两个参数，第一个为 `thisArg`，第二个为 **一个包含多个参数的数组(或者[类数组对对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects))**
- 使用 `call`，不显示参数个数，第一个为 `thisArg`，其余为 **参数列表**

即 `call()` 方法接受的是**一个参数列表**，而 `apply()` 方法接受的是**一个包含多个参数的数组(或者类数组对对象)**

因此，实现跟 `myCall`  几乎一样：

```js
Function.prototype.myApply = function(thisArg, args) {	// 仅传递参数不同
  const fnName = Symbol();
  thisArg[fnName] = this;
  thisArg[fnName](...args);
  delete thisArg[fnName];
};
```

因为 `apply` 的第二个参数仅支持数组(或者[类数组对对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects))，所以其实这里可以做一些拦截处理的。但这里在下就不做了，😄😄😄！！

## 4. bind

### 4.1 `bind` 方法

首先，一起来看看 MDN 对 `bind` 方法的定义。





## 总结

异步的函数

https://medium.com/@ankur_anand/implement-your-own-call-apply-and-bind-method-in-javascript-42cc85dba1b



































































