// 代码出自 JavaScript 设计模式与开发实践
const eventObj = {
  clientList: [],
  listen: function(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    };
    this.clientList[key].push(fn);  // 订阅的消息添加进缓存列表
  },
  trigger:  function() {
    const key  = Array.prototype.shift.call(arguments);
    const fns = this.clientList[key];

    if (!fns || fns.length === 0) { // 如果没有绑定对应的消息
      return false;
    };

    for (let i = 0, fn; fn = fns[i++]; ) {
      fn.apply(this, arguments);  // arguments 是 trigger 时带上的参数
    };
  }
};

const installEvent = function (obj) {
  for (const i in eventObj) {
    obj[i] = eventObj[i]
  }
};

const salesOffices = {};
installEvent(salesOffices);

salesOffices.listen('squareMeter88', function (price) {
  console.log('squareMeter88-价格', price);
});

salesOffices.listen('squareMeter100', function (price) {
  console.log('squareMeter100-价格', price);
});

salesOffices.trigger('squareMeter88', 200000);
salesOffices.trigger('squareMeter100', 300000);

 
const a = [function (params) {
  
}, function (params) {
  
}]

console.log(a[1] == a[2]);