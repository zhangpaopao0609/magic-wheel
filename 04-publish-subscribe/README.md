[toc]

# 手写轮子系列四 —— 手写发布订阅

准确的说，发布订阅不能称为一个轮子，而是一种设计模式。发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

## 1. 发布—订阅模式的应用

不论是在程序世界还是现实生活中，发布—订阅模式的应用都十分广泛：

### 1.1 现实世界中的应用

小明最近看上了一套房子，到了售楼处之后才被告知，该楼盘的房子早已售罄。好在不久后还有一些尾盘推出，但是开发商具体何时推出还不确定，所以此后每天小明都会打电话过去询问是否可以购买。除了小明，还有小红、小强、小龙也会每天向售楼处咨询这个问题。

一个星期过后，售楼小姐姐决定辞职，因为她厌倦了每天回答 1000 个相同内容的电话。

当然现实中并非如此，实际上是：小明离开之前，把电话号码留在了售楼处。售楼小姐姐答应他，新楼盘一推出就马上发信息通知小明。小红、小强和小龙也是样，他们的电话号码都被记在售楼处的花名册上，新楼盘推出的时候，售楼小姐姐会翻开花名册遍历上面的电话号码，依次发送一条短信来通知他们。

售楼处给购房者发送短信就是一个非常典型的发布—订阅模式，其中，购房者是订阅者，售楼处是发布者。除了以上的例子外，订阅公众号，订阅双 11 某店铺降价通知，都是发布订阅模式在生活中的表现。

### 1.2 程序世界中的应用

实际上，如果你曾经在 DOM 节点上绑定过事件函数，那就一定使用过发布—订阅模式。比如在 web 页面中期望给某个按钮添加点击事件，代码一般如下：

```html
<body>
  <button id='btn'>点击后弹出 alert 弹框</button>	<!-- 用户点击时相当于发布者发布消息 -->
  <script>
    const btn = document.getElementById('btn');
    btn.addEventListener('click', () => alert('用户点击了按钮！！'));  // 订阅者订阅了 btn 的click 时间
  </script>
</body>
```

程序并不知道用户将在什么时候点击这个按钮，**因此我们订阅按钮上的 click 事件，**当按钮被点击时，按钮节点会立即向订阅者发布这个消息，在这里，订阅者收到消息后会立即执行对应的回调函数 `() => alert('用户点击了按钮！！')`。

同时随意增加或删除订阅者也不会影响发布者（在这里发布者永远是点击按钮）。

## 2. 发布—订阅模式的作用

在售楼例子中，使用发布—订阅模式有着显而易见的优点：

- 购房者不用再每天都打电话给售楼部去咨询是否可以购房，在合适的时间点（新楼盘推出时）售楼处作为发布者（小姐姐相当于发布者的代理人）在会通知这些订阅者
- 购房者和售楼部之间不再强耦合在一起：购房者不用关心售楼部的变动，比如售楼小姐姐离职了，售楼部从一楼搬到了二楼，只要售楼部的花名册还在，这些改变都不会影响到购房者接收消息。

第一点说明：发布—订阅模式可以广泛应用于**异步编程中**，这是一种替代传递回调函数的方案。比如，我们可以订阅 ajax 请求的 error、success 等时事件。在异步编程中使用发布—订阅模式，就无须过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。

第二点说明：发布—订阅模式可以取代对象之间硬编码的通知机制，一个对象不再显式地调用另一个对象的某个接口。发布—订阅模式让两个对象松耦合地联系在一起，可以不用了解彼此的细节，但是不影响它们之间互相通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响到之前的订阅者。**只要之前约定的事件名没有变化**，就可以自由地改变它们。

## 3. 实现思路

除了程序为我们提供的发布—订阅模式机制外 —— 如：DOM 事件。我们自己如何实现自定义事件的发布订阅呢？比如在 ES6 Promise 的 `race all ` 等方法的实现中就使用到了发布订阅的机制，[可点击查看](https://github.com/ardor-zhang/magic-wheel/tree/main/01-promise-es6#23-promiseall)。下面就我们就来分析分析如何实现发布订阅—模式吧！

1. 订阅者 —— 订阅者期望收到发布者发布的消息并且是发布时立即收到
   - 在售楼的例子中：订阅者（即购房者）给发布者（即售楼处）留下了电话，<font color='red'>期望 </font>当楼盘推出时立即收到售楼部的电话并告知消息
   - 在程序中：订阅者给发布者留下了（传递了）回调函数，<font color='red'>期望 </font>发布者发布时立即执行传递的回调函数并传递参数
   - 伪代码：在某对象上订阅一个事件，并且传递一个回调函数，回调函数接收发布者传递的参数
   - pubsub-js为例：`PubSub.subscribe('getMessage', (message) => console.log(message))`， 此时，`PubSub` 就是某对象，可类比为售楼部，购房者订阅了 `getMessage` 的事件并且留下了一个回调函数，类比为留下了电话号码
   - 实现分析：实现一个对象，设为 `PublishSubscribe`，此对象提供一个<font color='red'> 订阅不同事件的 </font>方法（有的购房者咨询套三，有的咨询套四，因此需要支持订阅不同的事件类型），并且订阅时传递的回调函数要在发布者发布时被调用
2. 发布者 —— 发布者在发布时立即告知所有已订阅者
   - 在售楼的例子中：订阅者（即购房者）给发布者（即售楼处）留下了电话，当楼盘推出时 <font color='red'>会 </font>立即打电话给订阅者并告知消息
   - 在程序中：订阅者给发布者传递了回调函数，发布者发布时 <font color='red'>会 </font>立即执行传递的回调函数并传递参数
   - 伪代码：某对象发布某一个事件，此时<font color='red'> 依次 </font>执行所有已订阅此事件的订阅者传递的回调函数并传递参数（即发布的消息内容）
   - pubsub-js为例：`PubSub.publish('getMessage', '新楼盘已推出，速来购买！！')`，`PubSub` 即售楼部发布了楼盘推出的消息，那么此时，售楼部就会发消息给所有订阅者， `PubSub` 内部就会执行之前所有订阅者传递的回调函数
   - 实现分析：在对象 `PublishSubscribe` 上，需要实现一个<font color='red'> 发布不同事件的 </font>方法（与订阅同理），并且在发布时要依次调用订阅者传递的回调函数及传参

通过上述分析后，仅存在一个问题：既然发布者发布时要调用订阅者传递的回调函数，那如何得到这些回调函数呢？

- **是不是可以在订阅者订阅时将其保存下来呀**，而且执行时需要按顺序执行，那么是不是可以<font color='red'> 用一个数组</font> 保存就可以了，这就好比售楼部使用花名册依次保存所有购房者的电话号码是一样。

  ```js
  [回调函数1， 回调函数2，回调函数3....]
  ```

- 当然，不能简单的保存，需要分事件保存，不同事件的订阅者的回调函数当然是在各自的事件发布时才被调用，所以可以 <font color='red'> 用一个对象</font> 来保存不同事件所记录的订阅回调函数，这就好比售楼部使用大文件夹来保存所有不同类型购房者的花名册是一样。

  ```js
  {
    事件A： [回调函数A1， 回调函数A2，回调函数A3....],
    事件B： [回调函数B1， 回调函数B2，回调函数B3....],
    ...
  }
  ```

到此，订阅者可以订阅事件并传递回调函数，发布者可以发布事件并调用所有已订阅的回调函数同时调用时可传递发布消息。那么代码的实现也就呼之欲出了，下面我们就来看看代码吧！！

## 4. 实现代码

### 4.1 基础版

实现步骤如下：

1.  使用 Object `subscribes` 来保存所有的订阅事件，Object 键值对中：
   - 键：订阅的事件名
   - 值：一个数组 `subscribeCallbacks`（这个数组用于保存事件名对应的所有回调函数，<font color='red'>每个事件名都会对应一个数组 </font>）
2.  `on` 方法接收订阅的事件名和回调函数。`on` 方法将回调函数 push 到事件名对应的数组中
3. `emit` 方法接收发布的事件名和传递的参数。`emit` 方法执行（调用）这个事件名对应的所有函数并传递参数

```js
class PublishSubscribeBasic {
  subscribes = {}; // 保存所有的订阅事件

  /**
   * 订阅函数
   * @param {*} subscribe 订阅的事件名
   * @param {*} callback 订阅的回调函数
   */
  on(subscribe, callback) {
    const subscribeCallbacks = this.subscribes[subscribe] || [];
    this.subscribes[subscribe] = [...subscribeCallbacks, callback];
  };

  /**
   * 发布函数
   * @param {*} subscribe 订阅的事件名
   * @param  {...any} args 发布时传递的参数
   */
  emit(subscribe, ...args) {
    const subscribeCallbacks = this.subscribes[subscribe] || [];
    subscribeCallbacks.forEach(callback => callback.call(this, args));
  };
};

const pubsub = new PublishSubscribeBasic();
pubsub.on('A', (args) => console.log(args));	// 订阅一个 A 事件并传递回调函数
setTimeout(() => pubsub.emit('A', '这是 A 收到的第一个参数'), 1000);	// 一秒后发布 A 事件并传递参数

// [ '这是 A 收到的第一个参数' ] （一秒后打印结果）
```

可以看到，实现一个基础版的发布订阅是非常简单的，仅仅几行代码便可实现。 `on` 方法用于订阅者订阅事件和传递回调函数，`emit` 方法用于发布者发布事件和传递参数，`subscribes` 对象用于保存所有的订阅事件以及事件对应的回调函数。

### 4.2 进阶版

基础版的发布订阅可以实现简单的事件订阅和发布功能，但是还存在以下几点不尽如人意之处：

1. 仅支持订阅事件，但不支持取消订阅，进阶版中实现这一功能

2. 基础版采用的是 Object 保存所有订阅事件以及 Array 来保存事件对应的回调函数，因为发布订阅一般采用单例模式，即在全局中一般仅用一个对象来实现发布订阅所有的事件，所以一般会使用这个对象来 **存储** 较多的数据、**插入**和 **查找** 较多的次数，所以可以使用 Map 来替换 Object，具体的性能比对可参考《JavaScript 高级程序设计（第四版）》168 页 “6.4.3 选择 Object 还是 Map”。

   > 备注： 进阶版中不需要使用 Array，因此也不需要替换成 Set

进阶版的关键在于如何实现取消订阅：

- 订阅事件的过程其实是：告知发布者对象保存订阅者的信息即订阅者的回调函数，类比于购房者告知售楼部自己的电话号码售楼部将其写在花名册上
- 那么取消订阅就是相反的操作：购房者告知售楼部不要给自己打电话了，售楼部就会找到这个购房者的电话从花名册上删除掉，那么在程序中，就是告知发布者对象<font color='red'> 删除 </font>订阅者的信息，那么此时对象就去找到此订阅者对应的回调函数然后<font color='red'> 删除 </font>掉

那么此时的问题是：`PublishSubscribe` 对象如何找到订阅者对应的回调函数呢？要想找到，那么是不是应该在保存的时候就留下一个唯一的标识呀，就像购房者留下的电话号码。那么在保存订阅者的回调函数时，不再使用数组，而是使用键值对的形式，键使用唯一的表示如 uuid，值就是回调函数，订阅后，将这个唯一的标识返回给订阅者，订阅者就可以拿着这个唯一标识来取消订阅了，发布者可以拿着这个标识去查找，找到后删除这个键值对就实现了。

实现步骤如下：

1.  使用 Map `subscribes` 来保存所有的订阅事件，Map 键值对中：

   - 键：订阅的事件名
   - 值：一个新的 Map `subscribeCallbacks`（这个 Map 用于保存事件名对应的所有回调函数，<font color='red'>每个事件名都会对应一个 Map </font>）

2.  `on` 方法接收订阅的事件名和回调函数。`on` 方法会将下面这个键值对保存到<font color='red'>**事件对应**的</font> Map 中：

   - 键：一个由时间戳和随机数模拟的 uuid， `getUUID`
   - 值：传递的回调函数

   同时 `on` 方法将这个 **uuid 返回给订阅者，用于订阅者取消订阅时的唯一标识**

3. `emit` 方法接收发布的事件名和传递的参数。`emit` 方法执行（调用）这个事件对应的所有函数并传递参数

4. `remove` 方法接收一个标识。`remove` 方法在 `subscribes` 中查找这个标识：

   - 标识查找到并且如果为事件名：删除事件名对应的所有回调函数，即相当于事件取消了
   - 标识查找到并且如果为某个回调函数对应的 uuid：删除这个回调函数，即取消这个订阅者的回调
   - 标识未查找到，不做任何逻辑，可以返回错误等提示，看需求而定。

实现代码如下：

```js
class PublishSubscribe {
  subscribes = new Map(); // 保存所有的订阅事件
  
  /**
   * 模拟 UUID，用于某订阅事件回调函数对应的 key
   * @returns 模拟获取一个 UUID 
   */
  getUUID() {
    return String(Date.now()) + String(Math.random());
  };

  /**
   * 获取事件名对应的所有订阅事件，如果没有，返回一个空 Map
   * @param {*} subscribe 
   * @returns 事件名对应的所有订阅事件的回调函数
   */
  getSubscribe(subscribe) {
    return this.subscribes.get(subscribe) || new Map();
  };

  /**
   * 订阅函数
   * @param {*} subscribe 订阅的事件名
   * @param {*} callback 订阅的回调函数
   * @returns 本次订阅的标识符，用于之后取消订阅
   */
  on(subscribe, callback) {
    const uuid = this.getUUID();
    const subscribeCallbacks = this.getSubscribe(subscribe);
    subscribeCallbacks.set(uuid, callback);
    !this.subscribes.get(subscribe) && this.subscribes.set(subscribe, subscribeCallbacks);
    return uuid;
  };

  /**
   * 发布函数
   * @param {*} subscribe 订阅的事件名
   * @param  {...any} args 发布时传递的参数
   */
  emit(subscribe, ...args) {
    const subscribeCallbacks = this.getSubscribe(subscribe);
    for (const [uuid, callback] of subscribeCallbacks) {
      callback.call(this, args);
    };
  };

  /**
   * 取消订阅
   * @param {*} value 可以是事件名，此时会取消事件名对应的所有订阅；可以为某个订阅的 uuid，此时仅取消此个订阅
   */
  remove(value) {
    const isSubscribe = typeof value === 'string' && this.subscribes.get(value);  // 是事件名
    const isUUID = !isSubscribe && typeof value === 'string';

    if (isSubscribe) {
      this.subscribes.delete(value);
    } else if (isUUID) {
      for (const [subscribe, subscribeCallbacks] of this.subscribes) {
        for (const [uuid, callback] of subscribeCallbacks) {
          if (uuid === value) {
            subscribeCallbacks.delete(value);
            return;
          };
        };
      };
    } else {
      return;
    };
  };
};
```

上述的代码每个方法都有详细的注释，其中可能使用到了 Map 的一些 API，看不明白的可以稍微查一下。轮子也做了相应的单测，因单测较多，这里就不做罗列了，感兴趣的可以[点击查看](https://github.com/ardor-zhang/magic-wheel/tree/main/04-publish-subscribe)。

## 5. 总结

说实在的，自己开发这些年，发布订阅在开发中用得不算频繁，但它的思想却是在各大框架中随处可见，比如 vue 中就可以使用发布订阅来实现组件间的通信，又比如 Promise 中用发布订阅来实现静态方法 `all race` 。

如文章开始所讲，说发布—订阅是一种轮子，那格局就太小了；它妥妥的是一种设计模式，而且是非常好用、实用的设计模式，理解它，然后玩转它，走起！！

文中售楼处的例子来源于 《JavaScript 设计模式与开发实践》第八章发布——订阅模式，感恩前辈的付出，太强了。

[点击可查看本文所有代码](https://github.com/ardor-zhang/magic-wheel/tree/main/04-publish-subscribe)
