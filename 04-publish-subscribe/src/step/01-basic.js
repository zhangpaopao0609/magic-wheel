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