[toc]

# 开玩笑的吧！` call`、`apply`、`bind` 也能手写出来？

摘要：在工作中重复造轮子纯粹是浪费生命，但为了学习而尝试造一些 mini 版的轮子也是非常有意义的，而且全面的模拟常用的轮子还可以加深你对这些轮子的理解。

今天，就让我们一起来探索一番 javascript 中 `call`， `apply` 以及 `bind` 的实现原理，然后造出属于我们自己的 `call`， `apply` 以及 `bind` 吧！！

先在这里给出一个大大的结论：**实现 `call` 、`apply`、 `bind` 的关键就是，<font size='4.6'>想方设法的把显示的  `this` 绑定转化成隐式绑定</font>。** 可能你现在并不能立刻理解，不用担心，我们往下看，走起！！

## 1. 函数 this 的绑定规则

要想全面理解并手写 `call` 、`apply` 和 `bind` 方法，那么**深入理解 `this` 是前提**，但 `this` 所含内容绝非三两句可说清楚的，限于篇幅，本文在这里仅简单描述一些函数在执行过程中 this 的绑定对象所遵循的四个规则，如果你已经非常的清除，可以跳过，如果没有，请细细看：

1. 默认绑定

   当函数调用类型为：独立函数调用时， 函数的 `this` 为默认绑定，指向全局变量；在严格模式下，`this` 将绑定到 `undefined`。

   如下便为：独立函数调用

   ```js
   function foo() {
     console.log(this.a);
   }
   foo();
   ```

2. 隐式绑定

   当函数的 <font color='red'>调用位置</font> 有上下文对象时，或者说函数在被调用时 <font color='red'>被某个对象拥有或者包含时</font>，隐式绑定规则就会把函数调用中的 `this` 绑定到这个上下文对象。

   如下，foo 在调用时 `this` 便被隐式绑定到了 obj 上。

   ```js
   function foo() {
     console.log(this.a);
   }
   const obj = { a: 2, foo };
   obj.foo(); // 2
   ```

   需要特别注意一下<font color='red'>隐式绑定丢失</font>的情况，在这里不做详细说明。

3. 显示绑定

   使用 `call` 、 `apply` 和 `bind` 显示地绑定函数调用时的 `this` 指向，下面篇幅会详述，这里不再赘述。

4. `new` 绑定

   当使用 `new` 调用函数时，会发生 `this` 的指向绑定，但此处发生的 `this` 绑定与函数本身无关，因此这里不做过多说明。

> 关于 `this` 的指向问题，我会在下一篇文章中详细的讲述，这里为了更好的说明手写 `call` 、 `apply` 和 `bind` 方法，简单的进行了说明。

## 2. 手写 call

### 2.1 语法

首先，让我们来回顾一下 `call` 的基本语法和作用，详细可见 [Function.prototype.call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)。

```js
function.call(thisArg, arg1, arg2, ...)
```

1. **参数**

   - `thisArg`

     可选参数。`function` 在执行时函数内部的 `this` 值。注意：在某些情况下函数内部的 `this` 值并不指向传递的 `thisArg`：在[非严格模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)下，如果 `thisArg` 为 `null` 或者 `undefined`，将会替换成全局对象；如果 `thisArg` 为原始值，将会自动为其包装一个封装对象。

   - `arg1, arg2, ...`

     可选参数。传递给 `function` 的参数列表

2. **返回值**

   在 <font color='red'>指定的 `this` 值</font> 和 所传递的参数下 调用此函数的返回结果

3. **示例**

   ```js
   const user = { name: '张跑跑' };

   function showUserName(title) {
     console.log(title, this.name);
   }

   showUserName('hello:'); // hello: undefined
   showUserName.call(user, 'hello:'); // hello: 张跑跑
   ```

   上述示例直接调用 `showUserName('hello:')`，将打印出 `hello: undefined`，因为此时函数的 `this` 指向的是全局对象，全局对象上并没有 `name` 属性；通过 `call` 调用 `showUserName.call(user, 'hello:');`，将打印出 `hello: 张跑跑`，因为此时函数的 `this` 不再指向全局对象了，而是被 `call` 方法显示地指向了 `user` 对象。

4. 注意点

   `function.call(thisArg, ...)` 需要注意的是：

   - `function` 函数将会 <font color='red'>立即执行</font>

   - 在执行时，会 <font color='red'>**显示地**</font> 将函数内部的 `this` 指向了 `thisArg`

   - 除 `thisArg` 外的所有剩余参数将全部传递给 `function`

   - 返回 `function` 函数执行后的结果（当然是在上述 2， 3 情形下）

### 2.2 实现 `call` 方法

#### 2.2.1 实现思路

先让我们一起来看看下面这两段代码：

1. 使用 `call` 来显示地绑定 `showUserName` 在被调用时 `this` 指向 `user`，最终打印结果为 `hello: 张跑跑`

```js
const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
}
// 使用 call 来显示地绑定 showUserName 在被调用时 this 的指向
showUserName.call(user, 'hello:'); // 打印结果： hello: 张跑跑
```

2. 将 `showUserName` 函数作为 `user_fnName` 的属性值，<font color='red'>利用隐式绑定规则同样实现</font> 了 `showUserName` 在被调用时指向 `user_fnName`, 最终打印结果同样为 `hello: 张跑跑`

```js
const user_fnName = {
  name: '张跑跑',
  fnName: showUserName,
};
// 利用隐式绑定规则来实现 showUserName 在被调用时 this 的绑定
user_fnName.fnName('hello:'); // 打印结果： hello: 张跑跑
```

不知道你看完这两段代码后有没有什么奇思妙想哈！

<font size='4em'>**是不是可以利用隐式绑定的规则来实现 `call`、 `apply` 和 `bind` 的显示绑定能力呀！！**</font>

下面让我们一起来看看实现的思路吧，以 `function.call(thisArg, arg1, arg2,...)`为例说明：

1. 将 `function` 赋值给在 `thisArg` 对象的 `fnName` 属性

   `thisArg.fnName = function`

2. 将 `arg1, arg2, ...` 参数列表传递给 `thisArg.fnName` 并执行，<font color='red'>**此时函数在执行时的 `this` 因为隐式绑定的规则便指向了 `thiArg`** </font>，如此便实现了函数执行时 `this` 的显示绑定， 即：

   `const res = thisArg.fnName(arg1, arg2, ....)`

3. 第 1 点在 `thisArg` 上添加了 `fnName` 属性，给 `thisArg` 造成了副作用，因此需要在执行后将 `thisArg` 上的 `fnName` 属性删除掉，即清除掉副作用

   `delete thisArg.fnName`

4. 将 `thisArg.fnName(arg1, arg2, ....)` 的执行结果返回

   `return res`

> 如果没有完全理解到实现的思路，不用着急，往下看，我们一点点的来剖析

#### 2.2.2 基础实现

首先，让我们按照 2.2.1 中的实现思路来实现一个基础版的 `myCall` 方法吧！

```js
/**
 * 基础版 myCall
 * @param {*} fn 要显示绑定 this 的函数
 * @param {*} thisArg fn 被调用时 this 指向的对象（this 要绑定的对象）
 * @param  {...any} args 传递给 fn 的参数列表
 * @returns 返回 fn 执行后的结果
 */
function myCall(fn, thisArg, ...args) {
  thisArg.fnName = fn;
  const res = thisArg.fnName(...args); // 此时函数的 this 因隐式绑定指向了 thisArg
  delete thisArg.fnName;
  return res;
}
```

我们来一句一句的分析上述的代码：

1. `function myCall(fn, thisArg, ...args){}`， `myCall` 函数

   - `fn` 即期望在调用时显示绑定 `this` 的函数

   - `thisArg` `fn` 被调用时 `this` 指向的对象（`this` 要绑定的对象）

   - `...args` 传递给 `fn` 的参数列表，这里使用了 ES6 的 rest 参数特性，[点击可查看详情](https://es6.ruanyifeng.com/#docs/function#rest-%E5%8F%82%E6%95%B0)

     > 如果没有 rest 参数这个特性，想要传递参数列表应该怎么做呢？答案是需要使用已经废弃的 `arguments`

2. `thisArg.fnName = fn;`

   将 fn 赋值给 `thisArg` 的 `fnName`，此时的 `thisArg.fnName` 为一个**可调用的函数**

3. `const res = thisArg.fnName(...args);`

   - 执行 `thisArg.fnName` 这个函数，<font color='red'>**此时函数在执行时的 `this` 因为隐式绑定的规则便指向了 `thiArg`** </font>，即实现了显示绑定
   - 执行时传递参数，这里的 `(...args)` 使用了 ES6 的扩展运算符 `...` 特性，[点击可查看详情](https://es6.ruanyifeng.com/#docs/array#%E6%89%A9%E5%B1%95%E8%BF%90%E7%AE%97%E7%AC%A6)

4. `delete thisArg.fnName;`

   清除为 `thisArg` 对象带来的副作用

5. `return res;`

   返回 `thisArg.fnName(...args);` 执行后的结果。

简单测试如下：

```js
const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
}

myCall(showUserName, user, 'hello:'); // hello: 张跑跑
```

成功打印出了期望的结果，实现了 `this` 的显示绑定。

> 这里简单的说明一下上面用到的两个 ES6 特性
>
> - rest 参数（形式为 `...变量名`），用于获取函数的多余参数，rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。
> - 扩展运算符 `...`， 它好比 rest 参数的逆运算，将一个数组转为用逗号分隔的参数序列。

#### 2.2.3 唯一性保证

因为 `thisArg` 对象中可能存在 `fnName` 这个属性，所以 2.2.2 的实现并不鲁棒。那就需要避免这样的情况出现，需要一个**唯一的属性名**。

在 ES6 之前，我们可能需要使用 uuid 才能实现这个功能，但是 ES6 为我们提供了一个新的原始数据类型 `Symbol` ，表示独一无二的值，[点击可查看详情](https://es6.ruanyifeng.com/#docs/symbol)

```js
function myCall(fn, thisArg, ...args) {
  const fnName = Symbol(); // 将是独一无二的值
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
}
```

#### 2.2.4 挂载到 `Function.prototype`

在使用 `call` 方法时，我们并不是像 `myCall` 方法这样作为独立函数调用的，而是作为函数的方法执行的，如 `showUserName.call(user, 'hello:');` ，因此，我们的 `myCall` 也需如此。

那要如何实现呢？这就需要谈谈 js 的原型链和委托机制了，这属于 js 非常核心有趣的知识点了，下面做简单的说明，这里不做过多赘述。

**因为原型链和委托机制的缘故，在不手动修改原型的前提下，所有的函数的 [[prototype]] 链最终都会指向内置的 `Function.prototype`，<font color='red'>在函数的原型链上找不到的属性或者方法都会委托给 `Function.prototype`</font>，因此，只要在 `Function.prototype` 上挂载属性或者方法，那么所有的函数都可直接使用 `.` 语法找到。**

下面来看看实现的代码：

```js
Function.prototype.myCall = function (thisArg, ...args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};
```

同样，做一个详细的分析：

1. `Function.prototype.myCall = function(thisArg, ...args){}`

   将 `myCall` 方法挂载到 `Function.prototype`，如此，所有的函数都可直接使用 `.` 语法找到 `myCall` 方法

2. `thisArg[fnName] = this;`

   此处需要理解的是 `this`，这个 `this` 是个啥？<font color='red'> 同样因为隐式绑定规则的缘故，这里的 `this` 将指向调用 `myCall` 方法的函数 </font>，例如`showUserName.call(user, 'hello:');`，那么这个 `this` 就是 `showUserName` 函数。

其它的便与普通的 `myCall` 方法无异了。

至此，`myCall` 就基本实现了，但并不算完整，因为还有很多的边界条件未处理，比如严格模式和非严格模式下 `thisArg` 为不同值时进行不同的处理，但就学习而言，已经够够的啦！！

## 3. 手写 apply

从使用上来说， `apply()` 和 `call` 非常的相似，仅有一点区别：

- 使用 `apply` ，仅支持两个参数，第一个为 `thisArg`，第二个为 **一个包含多个参数的数组(或者[类数组对对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects))**
- 使用 `call`，不显示参数个数，第一个为 `thisArg`，其余为 **参数列表**

即 `call()` 方法接受的是**一个参数列表**，而 `apply()` 方法接受的是**一个包含多个参数的数组(或者类数组对对象)**

因此，实现跟 `myCall` 几乎一样：

```js
Function.prototype.myApply = function (thisArg, args) {
  // 仅传递参数不同
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};
```

因为 `apply` 的第二个参数仅支持数组(或者[类数组对对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects))，所以其实这里可以做一些拦截处理的。但这里在下就不做了，😄😄😄！！

## 4. 手写 bind

### 4.1 语法

首先，还是让我们来回顾一下 `bind` 的基本语法和作用，详细可见 [Function.prototype.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)。

```js
function.bind(thisArg, arg1, arg2, ...)
```

1. 参数：

   - `thisArg`

     可选参数。 `function.bind(thisArg, ...)` 执行时会生成一个包裹着 `function(...)` 的绑定函数，并且将 `function(...)` 的 `this` 指向 `thisArg`。如果使用 `new` 运算符调用这个生成的绑定函数 ，则忽略 `thisArg`。

   - `arg1, arg2, ...`

     可选参数。传递给 function 的参数列表

2. 返回值

   **具有 <font color='red'>指定 `this` 指向</font> 和 初始参数（如果提供）的给定函数的副本**

3. 注意点

   `function.bind(thisArg, ...)` 需要注意的是：

   - `bind` 方法将创建并返回一个新的函数，新函数称为绑定函数（bound function），并且此绑定函数包裹着原始函数
   - 在执行时，会 <font color='red'>**显示地**</font> 将 <font color='red'>原始函数  </font>内部的 `this` 指向了 `thisArg`
   - 除 `thisArg` 外的所有剩余参数将全部传递给 `function`
   - 如果使用 `new` 运算符调用生成的绑定函数 ，则忽略 `thisArg`

**一般情况下，可以认为 `bind` 方法与 `call` 方法几乎一致，只是 `function.call(thisArg, ...)` 会立即执行 `function` 函数，而 `function.bind(thisArg, ...)` 并不会立即执行，而是返回一个新的绑定函数。**

### 4.2 实现 bind 方法

#### 4.2.1 基础实现

有了实现 `call` 方法的引导，实现一个基础版的 `bind` 并不需要太多纠结。

1. 返回一个新的绑定函数
2. 要在绑定函数中执行 `function`，因此需要用到 <font color='red'>闭包的机制</font> 来使得可以在返回的新函数中获取到 `function`
3. 在新函数中执行与 `call` 方法几乎完全相同的过程
   - 将 `function ` 的 `this` 指向 `thisArg`
   - 将调用 `bind` 方法传递的参数传递给 `thisArg[fnName]`
   - 同时将执行 <font color='red'>返回的绑定函数</font> 时传递的参数传递给 `thisArg[fnName]`

```js
Function.prototype.myBind = function (thisArg, ...args1) {
  const fn = this;
  return function (...args2) {
    const fnName = Symbol();
    thisArg[fnName] = fn;
    // 1. args1：调用 `bind` 方法传递的参数 , 2. args2：执行返回的绑定函数时传递的参数
    const res = thisArg[fnName](...args1, ...args2);
    delete thisArg[fnName];
    return res;
  };
};
```

#### 4.2.2 当返回的绑定函数作为构造函数时忽略 `thisArg`

根据 MDN 的描述，当 `function.bind(thisArg, ...)` 执行后的返回函数（即绑定函数）作为构造函数被调用时（即使用 `new` 操作符调用）。

在 ES6 之前，想要判断一个函数是直接被调用的还是作为构造函数被调用的是需要费一些头脑的。但是 ES6 又为我们提供了一个新的特性：`new.target` 属性，这个属性仅支持在函数内部使用，当函数通过 `new` 命令或 `Reflect.construct()` 调用时，`new.target ` 就返回这个函数，反之，则返回 `undefined`，因此可以使用这个属性来判断函数是直接调用的还是作为构造函数调用的。

> 不得不说， ES6 真的为我们提供很多便利的特性呀！！

如此，仅需要一个简单的分支即可实现想要的功能：

1. 为返回的绑定函数命名，如此，才能在函数内部获取到函数本身
2. 利用 `new.target` 来判断当前函数是直接调用的还是作为构造函数调用的

```js
Function.prototype.myBind = function (thisArg, ...args1) {
  const fn = this;
  return function BindedFn(...args2) {
    if (new.target === BindedFn) {
      return fn(...args1, ...args2);
    }
    const fnName = Symbol();
    thisArg[fnName] = fn;
    const res = thisArg[fnName](...args1, ...args2);
    delete thisArg[fnName];
    return res;
  };
};
```

#### 4.2.3 利用 `call` 方法快速实现 `bind` 方法

由上可知，`call` 方法和 `bind` 方法最大的区别就是：`function.call()` 方法会直接执行 `function` ，而 `function.bind()` 是返回一个新的绑定函数，其它方面均一致（即绑定 `this` 的指向），因此，完全可以使用 `call` 方法来快速实现 `bind` 方法。

1. 当返回的绑定函数作为构造函数调用时，直接执行原函数即可（当然需要传递参数）
2. 当返回的绑定函数作为普通函数调用时，利用 `call` 方法实现 `this` 指向的绑定以及参数的传递

```js
Function.prototype.myBindPerfect = function (thisArg, ...args1) {
  const fn = this;
  return function BindedFn(...args2) {
    if (new.target === BindedFn) {
      return fn(...args1, ...args2);
    }
    return fn.call(thisArg, ...args1, ...args2);
  };
};
```

至此，`bind` 方法也基本实现了，但同 `call` 方法一样，还有很多的边界条件未处理， 但同样就学习而言，足矣。

## 5. 总结

我想，现在应该已经理解了文章开头的总结了 —— 实现 `call` 、`apply`、 `bind` 的关键就是，把显示地 `this` 绑定想方设法的转化成隐式绑定。

点击[查看本文源码](https://github.com/ardor-zhang/magic-wheel/tree/main/05-call-apply-bind)，包括实现的每一个步骤和详细的注释以及每个方法对应的测试。[点击可查看实现步骤](https://github.com/Ardor-Zhang/magic-wheel/tree/main/05-call-apply-bind/src/step)

相信大部分同学都会觉得 `call`、`apply` 和 `bind` 方法是属于内置的吧，恐怕是万万没想到还能直接造出来的。

可当我们探索完后再回首，恐怕会感慨一句，原来是这样的呀！！

写到最后才发现，其实造轮子的过程真的蛮满足的，很多曾经不甚了解的，一一呈现在面前了！！

在这里留下几个有趣的点吧！

1. 在实现 `call`、`apply` 和 `bind` 方法的时候，用到了很多 ES6 提供的新特性，真的为我们提供了很多便利，想想，如果没有这些新特性，身处 ES5 ，我们又该如何实现呢？可能你会说我脱裤子放屁，但是想想还是挺有趣的
2. `call`、`apply` 和 `bind` 方法还有很多边界问题没有处理，如果你感兴趣的话，试试看了

参考文献：

1. [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
2. [ES6 入门教程](https://es6.ruanyifeng.com/#README)
3. [Implement your own — call(), apply() and bind() method in JavaScript](https://medium.com/@ankur_anand/implement-your-own-call-apply-and-bind-method-in-javascript-42cc85dba1b)

<div>
	<img src='./img/call-apply-bind.jpeg' />
</div>
