class PublishSubscribe {
  subscribes = new Map();

  on(subscribe, callback) {
    const subscribeArr = this.subscribes.get(subscribe) || [];
    this.subscribes.set(subscribe, [...subscribeArr, callback]);
    return [subscribe, callback];
  };

  emit(subscribe, ...args) {
    const subscribeArr = this.subscribes.get(subscribe) || [];
    subscribeArr.forEach(item => {
      item(...args);                                                                    
    });
  };

  remove(fnKey) {
    let subscribeArr = this.subscribes.get(fnKey[0]) || [];
    subscribeArr = subscribeArr.filter(callback => callback !== fnKey[1]);
    this.subscribes.set(fnKey[0], subscribeArr);
  };
};

const message = '这是 getMessage 收到的第一个参数';
const pubsub = new PublishSubscribe();
const p = pubsub.on('getMessage', (args) => {
  console.log(message);
});
pubsub.emit('getMessage', message);

pubsub.remove(p);
pubsub.emit('getMessage', message);

module.exports = new PublishSubscribe();