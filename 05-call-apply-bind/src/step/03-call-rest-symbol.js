Function.prototype.myCall = function(thisArg, ...args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};

const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
};

showUserName.myCall(user, '姓名', '--');  // 张跑跑

Function.prototype.myCall = function(thisArg, ...args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};
