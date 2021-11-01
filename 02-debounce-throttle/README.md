[toc]

# 手写防抖和节流

## 1. 前言

防抖和节流是前端性能优化上一个非常重要的技术，用得恰当可以很好的提高前端应用的性能。而这两个技术除了经常会在面试当中被问到其中原理以及让面试者手动的实现外，更多的是在实际的开发中它的确相当常用。

首先，需要明白防抖和节流的目的：为了<font color='red'>**规避频繁触发回调**</font>导致大量计算，从而影响页面发生抖动甚至卡顿。

举一个实际的例子：当页面很长时，一般会实现一个回到顶部的按钮，按钮的实现通常采用监听滚动条所在的位置，当大于某个值（如1000）时就出现。这里就以获取滚动条位置为例说明，一般会如下实现：

```html
<body>
  <script>
    function getScrollPosition() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      console.log('滚动条位置：' + scrollTop);
    }
    
    window.onscroll = getScrollPosition;
  </script>
</body>
```

当滑动滚动条时，`getScrollPosition` 方法会<font color='red'>**一直触发**</font>，如下：

<div align='center'>
  <img src='./img/getScrillPosition-1.png' style='zoom: 30%' width='30%' />
</div>


这里只是一个简单的控制台打印，试想一下，**如果这里是一个复杂的逻辑计算呢？又或者说这里是向服务器发起 ajax 请求呢？**如果不做处理的话，后果将不堪设想。这时候防抖和节流技术就可以发挥其真正的实力了，下面就来详细的讲解如何自己手动实现一个防抖和节流。

## 2. 防抖（debounce）

基于以上场景，滚动条一旦滚动就会立即触发对应的回调函数，那是否可以有一个方法能够实现如果**当一直处于滑动状态时便不去执行回调函数**，**而是等到不滑动了再去执行**，这样便不会执行多次了，只会在停下来后（200ms或者自定义一个时间）才去执行一次，这样就不会触发很多次了。这个想法就是常说的**防抖**。

> 一直处于滑动状态：有时候可能会稍微的停顿，但如果停顿的时间很短，短于设置的 “停下来后执行回调函数的时间（200ms或者自定义一个时间）”，也认为是一直处于滑动状态的。

按照这个思路，整体原理和实现也是呼之欲出了：

1. 设置一个定时器用于触发真正的回调函数并保存下来，定时器的时间为期望停止触发防抖函数后间隔多久真正执行回调函数的时间（例如200ms 或者任意时间，建议不可太短也不可太长，太短防抖意义不大，太长体验不佳）
2. 当在间隔时间以内再次触发防抖函数，那么便清除前一个定时器并设置一个新的定时器

问题来了：每一次都在调用防抖函数，那么如何记录前一个定时器呢？<font color='red'>**答案是利用闭包的机制**</font>，这也是面试官考察实现防抖节流的一个重要原因。利用 js 闭包的机制可以维护一个私有变量，这个私有变量便可以用来保存定时器。

因此，利用 `setTimeout` 来计时和执行回调函数以及 `clearTimeOut` 来清除定时器，再加上闭包的机制记录定时器便可轻松实现，话不多说，上代码。

```js
/**
 * 防抖函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} delay 停止触发事件多久后真正执行回调
 */
function debounce(fn, delay) {
  let timer = null; // 闭包私有变量记录定时器

  return function (...args) { // 回调函数的参数接收
    clearTimeout(timer);  // 清除定时器，不论是否存在上一个定时器，直接清除
    timer = setTimeout(() => fn(...args), delay); // 创建新的定时器
  };
};
```

代码相当的简洁，**仅仅只有 4 行，值得细细品味**。简单测试如下：

```html
<script>
  function getScrollPosition(event) {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    console.log('滚动条位置:', scrollTop, '滚动事件:', event);
  };

  window.onscroll = debounce(getScrollPosition, 1000);
</script>
```

运行代码你会发现，这时候如果持续滚动滚动条，获取滚动条位置的事件是不会触发的，而是会等到停止触发 1000ms以后才会执行，代码中注释已经做了详细的解释了。

## 3. 节流（throttle）

防抖的确能够避免频繁触发回调，但是如果我们希望在滑动的过程中，每隔一段时间至少执行一次呢？又当如何呢？

举个栗子，长页面中通过 ajax 回调去获取图片，如果用户一直滑动不停，采用防抖的话，页面会一直是空白的，而实际上希望的是，虽然是在一直滑动不停，但是每隔一段时间还是发起一次 ajax 请求去获取图片，这样不会让页面一直是空白状态。另一个栗子，用户在输入框中不断输入，在键盘按下时发起 ajax 请求数据，如果不做处理，用户输入过快将发起大量的 ajax，此时如果采用防抖的方式达不到预期的用户一边输入一边请求数据的目的，此时呢，节流便出场了。

按照每隔一段时间执行一次回调函数的思路，具体实现步骤如下：

1. 

当一直触发事件时，首先肯定仍然是不能使其一直触发执行，但是需要每个一段时间执行，首先想到的还是定时器 `setTimeout`，话不多说，上代码。

```html
<body>
  <script>
    function getScrollPosition() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      console.log('滚动条位置：' + scrollTop);
    };
    /**
     * 节流函数
     * @param {*} fn 需要执行的事件（操作）
     * @param {*} time 每隔 time 这段时间都需要执行一次
     */
    function throttle(fn, time) {
      let notYet = true;         // 一开始肯定是要去执行定制器的嘛，因为从触发开始就需要计时了
      return function() {
        if(!notYet) {            // 时间未到，直接什么也不做
          return;
        }else {                 // 时间到了（也就是上一个定制器执行了），该去启动下一个定制器了
          notYet = false;        
          setTimeout(() => {
            fn();
            notYet = true;
          }, time);
        }
      }
    }
    
    window.onscroll = throttle(getScrollPosition, 2000);
  </script>
</body>
```

节流的目的就是每隔一段时间一定要去执行一次，因此，只要能够记录上一次执行的时间，然后加上需要间隔的时间，得到下一次执行的时间，节流都能够实现，因此，除了`setTimeout` 之外，记录时间戳也是完全可以的。如下所示

```html
<body>
  <script>
    function getScrollPosition() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      console.log('滚动条位置：' + scrollTop);
    };
    /**
     * 节流函数
     * @param {*} fn 需要执行的事件（操作）
     * @param {*} time 每隔 time 这段时间都需要执行一次
     */
    function throttleTimeStamp(fn, time) {
      let notYet = Date.now();
      return function() {
        let now = Date.now();
        if(notYet + time > now ) {       // 时间未到，直接什么也不做
          return;
        }else {                         // 时间到了,该执行了
          notYet = now;        
          fn();
        }
      }
    }
    
    window.onscroll = throttleTimeStamp(getScrollPosition, 2000);
  </script>
</body>
```

## 4. 其它应用场景

1. input 搜索框，有时候我们的需求是，用户边输入就边去发起 ajax 请求，这时候可以采用节流技术，每间隔一段时间就去执行一次。
2. 页面resize事件，用户需要放大或缩小页面是，因为最终结果是呈现最后的样子，因此，可以采用防抖技术。

## 5. 总结

相同点：

- 都是为了处理高频率触发事件下造成的性能或者卡顿问题。

异同点：

- 防抖：当触发事件结束后才真正的执行对应的事件，中间不执行；
- 节流：每隔一段时间都去执行一次事件（当然是在触发的过程中）

[点击查看源码地址，顺便给个star吧！！](https://github.com/Arrow-zb/magic-wheel)