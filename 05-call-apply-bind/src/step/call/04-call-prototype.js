Function.prototype.myCall = function(thisArg, ...args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};

const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
};

showUserName.myCall(user, 'hello:');
