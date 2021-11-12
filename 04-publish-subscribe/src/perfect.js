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

module.exports = new PublishSubscribe();