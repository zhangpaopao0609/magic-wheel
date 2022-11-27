[toc]

# 手写轮子系列三 —— 手写模板引擎

摘要： 模板引擎的出现引发了一系列的前端变革：前后端混合开发、MVVM 框架等；更加重要的是它使得前端视图更好的与逻辑分离，那它是如何实现与运作的呢？本文就来聊聊并手写一个吧！！

## 1. 前言

在没有模板引擎的年代，前端想要把数据渲染到页面，绝大部分都是直接操作 DOM 来实现的；可直接操作 DOM 不仅繁琐而且性能低下，同时还将视图和业务逻辑（数据）完全耦合在一起。

为了能够解决上述问题，模板引擎随之出现。一经出世，前端不论是 MVP，MVC 还是 MVVM 架构，其中所有的 V 层（view 层）都会采用模板引擎，如著名框架 vue 中的 `{{ }}`，服务端常用的 ejs 中的 `<% %>` ， 还有以性能著称的 art-template 中的 `{{ }}`，这些都是模板引擎。

模板引擎的引入使得开发者可以标签中写 js 语句和使用变量，同时在构建的过程中执行 js 语句和变量，不再需要操作 DOM 来实现数据的渲染以及很好的实现了视图和数据的分离。

那模板引擎是如何实现的呢？变量是如何渲染到 DOM 上的呢？ 其中的 js 语句又是如何执行的呢？ 下面就让我们一步一步地来解析其中原理并写一个自己的模板引擎吧！！

## 2. 模板引擎功能分析

知己知彼才能百战不殆。下面就让我们以著名的 ejs 模板引擎为例，分析一下模板引擎的具体功能，然后再一一攻破它。

### 2.1 变量渲染 —— `<%= %>`

ejs 中支持以 `<%= %>` 来渲染变量。假设有变量 `name='arrow'` ，ejs 在 `<%= name %>` 中能够渲染对应的值，同时还能够处理中的 js 表达式，比如 `<%= name.toUpperCase() %>`。

| 模板                                 | 渲染的 dom 结果      |
| ------------------------------------ | -------------------- |
| `<h1><%= name %></h1>`               | `<h1>arrow</h1>`     |
| `<h1><%= name.toUpperCase() %></h1>` | `<h1>ARROW</h1>`     |
| `<h1>(<%= '[' + name + ']' %>)</h1>` | `<h1>([arrow])</h1>` |

### 2.2 执行 js 语句和表达式 —— `<% %>`

ejs 中支持以 `<% %>` 来执行 js 语句和表达式

1. js 语句

   ```
   <% if(isShow) { %>
   	<h1><%= name %></h1>
   <% }else { %>
   	<h1>isShow is false</h1>
   <% } %>
   ```

   - 当 `isShow `为 `true` 时，对应渲染的 DOM 结果应当为 `<h1>arrow</h1>`
   - 当 `isShow`为 `false`时，对应渲染的 DOM 结果应当为 `	<h1>isShow is false</h1> `。

2. js 表达式

   除了 js 语句外，表达式也是直接支持的，假设有 `arr=['aaa', 'bbb']`，当有如下 code 时：

   ```
   <ul>
     <% arrs.forEach(item => { %>
     	<li><%= item %> </li>
     <% }) %>
   </ul>
   ```

   对应渲染的 DOM 结果应当为 ：

   ```html
   <ul>
     <li>aaa</li>
     <li>bbb</li>
   </ul>
   ul>
   ```

## 3. 实现思路

实现一个模板引擎，要三个问题需要去思考，假设期望实现一个 `{{ }}` 写变量 `{% %}` 写 js 语句和表达式的模板引擎：

### 3.1 如何识别标签中的变量和 js 语句？

有一点需要明确，编写好的标签文件，如 `.ejs` 文件，它的内容其实就是**一串长长的字符串**，同时，这个字符串里 `{{ }}` 里面包裹的是就是变量，`{% %}` 里面包裹的就是 js 语句和表达式。既然是固定的模式，那么是不是可以采用<font color='red'>**正则表达式来识别**</font>呢？

因此，这个问题的解决方案可以是： 利用正则表达式来识别变量和 js 语句。

### 3.2 标签中的变量怎么替换成变量值？

直接思考这个问题比较难，先来看第三个问题。第三个问题会给出这个问题的答案。

### 3.3 标签中的 js 语句怎么执行？

得到的标签文件是一串字符串，字符串中包含可执行的 js 语句并且是在构建的过程中就要执行，那么问题来了，字符串如何能执行呢？

js 中提供了两种方法来字符串变成 js 语句进行执行：

1. `eval(str)`

   方法直接接收字符串为参数并执行，但具有较高安全问题并且无法传递参数，因此，弃用

2. `new Function([arg1, arg2,...], str)`

   这是利用 `Function` 构造函数来创建函数的方法，因其繁琐，所以不常用。它接收多个参数，最后一个参数将会变成函数体的内容，其它参数为形参，且只能为字符串。

   如下是使用 `new Function` 创建一个函数，函数体内容为 `str` 字符串，形参为 `name`，生成的函数为一个匿名函数，函数体内容就是解析的字符串，执行时传递对应参数即可。

   ```js
   const str = "let str = '我的名字是：'; str += name; console.log(str);";
   const fn = new Function('name', str);

   console.log(fn.toString());
   // function anonymous(name) {
   //   let str = '我的名字是：';
   //   str += name;
   //   console.log(str);
   // };
   fn('张跑跑');
   // 我的名字是：张跑跑
   ```

   既然可以使用 `new Function` 来将字符串解析为函数体内容，然后调用这个函数，也就相当于执行了字符串了。当然标签文件中一部分是 js 语句，一部分不是，是 js 语句部分的让其解析执行，不是的保持为字符串即可，如上例 `str` 字符串中的 `'我的名字是：'` 就保留为了原本的字符串。

   因此，本问题的解决方案可以是：利用 `new Function` 来执行标签文件中的 js 语句部分，非 js 语句部分保留为原本字符串即可。

现在再回过头看看第二个问题，变量值怎么替换？既然标签文件字符串作为了函数的函数体，那么将**变量作为参数传递是否**就可以实现呢？

有了这样的思路，再来处理其中的细节，一步一步实现，模板引擎也就呼之欲出。

## 4. 实现步骤

如期望实现一个 `{{ }}` 写变量 `{% %}` 写 js 语句和表达式的模板引擎，并解析下面这段标签文件。

```
{% if(isShow) { %}
	<b>{{ name }}</b>
{% }else { %}
	isShow is false
{% } %}
<ul>
  {% arrs.forEach(item => { %}
  	<li>{{ item }} </li>
  {% }) %}
</ul>
```

获取到的标签文件字符串为：

```js
'{% if(isShow) { %} <b>{{ name }}</b> {% }else{ %} isShow is false {% } %} <ul>{% arr.forEach(item => { %} <li>{{ item }}</li> {% }) %}</ul>';
```

此时，有三点需要考虑说明（<font color='red'>这三点非常重要</font>）：

1. **非 js 语句和表达式部分**需要保留为字符串

   因为最终要使用 `new Function` 来执行标签文件中的 js 语句部分，但并不是全部都执行，那么就需要将 js 语句和表达式部分和非 js 语句和表达式部分进行分隔，非 js 语句和表达式部分需要原封不动的成为 <font color='red'>**函数体中的字符串**</font>，处理也很简单，在标签文件字符串中非语句和表达式部分再加上一层引号，那么它在函数体内部就仍然是字符串了，如： `"let str = ''; str += '我的名字是'"` 中的 `'我的名字是'` 。

   因此，需要将获取到的标签文件处理成（前后添加了一个引号）：

   ```js
   "'整个标签文件字符串'";
   ```

   然后再去识别其中的 js 语句和表达式部分，是 js 语句和表达式部分的，分隔出来，处理方式：

   ```js
   "let str = ''; str += '非js语句和表达式部分'; js 语句和表达式部分; str +='非js语句和表达式部分'; js语句和表达式部分; str +='非js语句和表达式部分'...... return str;";
   ```

2. 变量并不能执行，而是应该变成值后成为字符串的一部分

   在非 js 语句和表达式部分中，里面包含了变量，这里的变量也要处理，如 `str += '非js语句和表达式部分'` 中存在 `{{ }}` 包裹的变量，那么处理方式如下：

   ```js
   // str += '非js语句和表达式部分'
   str += '前一部分';
   str += 变量;
   str += '后一部分';
   ```

   这样处理是可以的，但其实还有更加简单的处理方式：

   ```js
   // str += '非js语句和表达式部分'
   str += `前一部分${变量}后一部分`;
   ```

   也就是不再使用引号来包裹非 js 语句和表达式部分了，而是使用反引号，也就变成了模板字符串，那么直接将 `{{ }}` 替换成 `${ }` ，直接就可以识别变量了，同时 `{{ }}` 中变量的 js 表达式也能直接支持。

3. `new Function()` 传递参数问题

   `new Function()` 在创建时就需要指定传递的参数个数（最后一个是函数体内容，其余为形参），那在真正使用时，并不知晓用户有多个少个参数需要传递，那么通常只传递一个对象如 `new Function('obj', str)` ，那在使用时就需要在代码中写成 `obj.a   obj.b `，也就是编写标签文件时使用变量需要写成这样的形式，显然是不合理的。

   那要如何解决呢？解决办法也很简单，利用 js 中一个“修改”作用域（或者叫欺骗作用域）的关键字 `with` 即可实现，`with(obj) { xxx }` 方法可将包裹其中的代码的上一级作用域指向 `obj`，如：

   ```js
   const name = 'arrow';
   const obj = { name: 'zhangpaopao' };
   with (obj) {
     console.log(name);
   }
   // zhangpaopao
   ```

   因此， 仅需要将标签文件字符串全部包裹在 `with(obj){ }` 中，那么其中的上一级作用域都指向了 `obj`，便可不用再写成 `obj.xxx` 了。

有了这三点的考虑，下面就来一步步实现：

### 4.1 处理获取到的标签文件字符串

1. 添加一个 `str` 用于累加处理后的字符串
2. 将所有的字符串包裹在 `with` 中，并且所有的字符串用反引号包裹
3. 添加导出

```js
const head = "let str = ''\nwith(obj){\nstr += `";
const tail = '`\n}\nreturn str;';
```

### 4.2 解析 `{{ }}` 中的变量

利用正则解析变量，那么直接将 `{{ }}` 替换成 `${ }` ，同时 `{{ }}` 中变量的 js 表达式也能解析。

```js
// 解析 {{  }}  对应的正则
const reMustache = /\{\{([^}]+)\}\}/g;
// 将 {{ arg }} 直接替换成 ${ arg }
templateStr = templateStr.replace(reMustache, ($0, $1) => {
  return '${' + $1.trim() + '}';
});
```

### 4.3 解析 js 语句和表达式部分

利用正则解析 js 语句和表达式部分，并且将其与非 js 语句和表达式部分用反引号进行隔离

```js
// 解析 {% %} 对应的正则
const reJsScript = /\{\%([^%]+)\%\}/g;
// 首先直接获取到对应的js语句
// 然后因为 js 不可以被包含在模板字符串中，因此需要特殊处理，前添加一个 `, 承接上一个 `， 后利用 str+= ` 来承接下面的字符串
templateStr = templateStr.replace(reJsScript, ($0, $1) => {
  return '`\n' + $1.trim() + '\nstr+=`';
});
```

### 4.4 函数生成和参数传递

使用 `new Function()` 函数生成解析函数，并且 `obj` 为形参，拼接好的字符串为函数体内容。

```js
const generatorStr = head + templateStr + tail;
const generator = new Function('obj', generatorStr);
```

### 4.5 完整代码以及测试

将上述代码整合，即实现了一个模板引擎。

```js
function compiler(templateStr) {
  // 解析 {{  }}  对应的正则
  const reMustache = /\{\{([^}]+)\}\}/g;
  // 将 {{ arg }} 直接替换成 ${ arg }
  let templateRenderRes = templateStr.replace(reMustache, ($0, $1) => {
    return '${' + $1.trim() + '}';
  });

  // 解析 {% %} 对应的正则
  const reJsScript = /\{\%([^%]+)\%\}/g;
  // 首先直接获取到对应的js语句
  // 然后因为 js 不可以被包含在模板字符串中，因此需要特殊处理，前添加一个 `, 承接上一个 `， 后利用 str+= ` 来承接下面的字符串
  templateRenderRes = templateRenderRes.replace(reJsScript, ($0, $1) => {
    return '`\n' + $1.trim() + ';\nstr+=`';
  });

  const head = "let str = '';\nwith(obj){\nstr += `";
  const tail = '`\n};\nreturn str;';
  const generatorStr = head + templateRenderRes + tail;
  const generator = new Function('obj', generatorStr);
  return (obj) => generator(obj);
}
```

测试文件：

```js
const compiler = require('../index');

it('解析 {{  }}', () => {
  const output = compiler('<h1>{{ name }}</h1>')({ name: 'arrow' });
  expect(output).toBe(`<h1>arrow</h1>`);
});

it('{{}} toUpperCase 表达式', () => {
  const output = compiler('<h1>{{ name.toUpperCase() }}</h1>')({
    name: 'arrow',
  });
  expect(output).toBe(`<h1>ARROW</h1>`);
});

it('{% %} js  语句', () => {
  const output = compiler(
    '{% arr.forEach(item => { %}<div>{{ item }}</div>{% }) %}',
  )({ arr: [1, 2] });
  expect(output).toBe(`<div>1</div><div>2</div>`);
});
```

测试全部通过

<div align='center'>
  <img src='./img/test.png' style='width: 26%' zoom='26%'/>
</div>

## 5. 总结

模板引擎的出现给前端带来的不仅仅是框架上的进步，还有开发模式，开发体验的变革，了解其中的原理，发现其中的奥秘还有很有意思的。

这里还着重指出两点：

1. `new Function()` 这种在程序中动态生成代码的方法并不推荐使用，除了使用繁琐外，它带来的好处是无法抵消性能上的损失。
2. `with` 在使用上更像是 “修改”（也可以说是欺骗）了词法作用域，会导致性能下降，因此，在实际开发中，不推荐使用，同时在严格模式下，`with` 是完全禁用的。

以上两点内容来自 《你不知道的 JavaScript》上卷。

本文给出的方案并非是最优的方案，比如正则模式替换就存在可以优化的地方，这里仅仅给出一个思路，期望大家可以自己写一个更完美的模板引擎。

[点击可查看源码地址，感兴趣的可以看看](https://github.com/Ardor-Zhang/magic-wheel/tree/main/03-template-engine)。
