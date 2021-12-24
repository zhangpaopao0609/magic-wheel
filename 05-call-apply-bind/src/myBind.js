Function.prototype.myCall = function(thisArg, ...args) {
  const fnName = Symbol();
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};

// 1. 在 Function.prototype 上定义 muBind 方法
Function.prototype.myBind = function(thisArg, ...args1) {
  // 2. 保存 this, 此处的 this 指向的是调用 myBind 的那个函数
  const fn = this;
  // 3. 返回绑定函数，此函数作为普通函数被调用时，this 将显示绑定到 thisArg 上，作为普通函数调用时，会忽略 thisArg
  return function BindedFn (...args2) {
    // 4. 利用 new.target 判断 BindedFn 函数是作为构造函数调用还是普通函数调用
    if (new.target === BindedFn) {
      // 5. BindedFn 函数作为构造函数调用时忽略 thisArg
      return fn(...args1, ...args2);
    };
    // 6. BindedFn 函数作为普通函数调用时，利用 myCall 方法来
    return fn.myCall(thisArg, ...args1, ...args2)
  };
};
