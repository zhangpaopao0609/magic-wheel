// 与 call 方法的唯一区别就是仅接受两个参数，第一个参数为函数调用时 this 显示绑定的对象，第二个为由函数参数组成的数组
Function.prototype.myApply = function(thisArg, args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};
