Function.prototype.myApply = function(thisArg, args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  thisArg[fnName](...args);
  delete thisArg[fnName];
};

const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
};

showUserName.myCall(user, '姓名', '--');  // 张跑跑
