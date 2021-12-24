// 1. 在 Function.prototype 对象上添加 myCall 属性，并且值为一个可接收多个参数的函数，如此，所有函数都可以调用 myCall 方法
// 2. myCall 方法接收多个参数，第一个参数为函数调用时 this 显示绑定的对象，其余为函数参数列表
Function.prototype.myCall = function(thisArg, ...args) {
  // 3. 利用 Symbol 保证 fnName 唯一
  const fnName = Symbol();
  // 4. 在 thisArg 上添加 fnName 属性，并且值为 this 对象(即调用 myCall 方法的函数)
  thisArg[fnName] = this;
  // 5. 执行 thisArg[fnName] 函数，如此便利用隐式绑定的机制实现了函数调用是显示地 this 绑定
  const res = thisArg[fnName](...args);
  // 6. 删除掉 fnName 属性， 即清除给 thisArg 带来的副作用
  delete thisArg[fnName];
  // 7. 返回函数执行的结果
  return res;
};
