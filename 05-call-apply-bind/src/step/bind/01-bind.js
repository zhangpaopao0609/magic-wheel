/**
 * 利用闭包的机制保存原函数
 * @param {*} thisArg 
 * @param  {...any} args1 
 * @returns 
 */
Function.prototype.myBind = function(thisArg, ...args1) {
  const fn = this;
  return function(...args2) {
    const fnName = Symbol();
    thisArg[fnName] = fn;
    const res = thisArg[fnName](...args1, ...args2);
    delete thisArg[fnName];
    return res;
  }
};

/**
 * 直接使用箭头函数的机制，不再需要 this 的中转
 * @param {*} thisArg 
 * @param  {...any} args1 
 * @returns 
 */
Function.prototype.myBindArrow = function(thisArg, ...args1) {
  return (...args2) => {
    const fnName = Symbol();
    thisArg[fnName] = this;
    const res = thisArg[fnName](...args1, ...args2);
    delete thisArg[fnName];
    return res;
  }
};

/**
 * 测试
 */
const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
};

const showUserNameBind = showUserName.myBind(user, '姓名');
const showUserNameBindArrow = showUserName.myBindArrow(user, '姓名');

showUserNameBind('---');
showUserNameBindArrow('---');
