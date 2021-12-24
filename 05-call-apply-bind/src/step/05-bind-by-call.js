/**
 * 利用闭包的机制保存原函数，然后利用 call 来实现 this 指向的绑定
 * @param {*} thisArg 
 * @param  {...any} args1 
 * @returns 
 */
 Function.prototype.myBindByCall = function(thisArg, ...args1) {
  const fn = this;
  return function(...args2) {
    return fn.call(thisArg, ...args1, ...args2);
  };
};

/**
 * 直接使用箭头函数的机制，不再需要 this 的中转
 * @param {*} thisArg 
 * @param  {...any} args1 
 * @returns 
 */
Function.prototype.myBindByCallArrow = function(thisArg, ...args1) {
  return (...args2) => this.call(thisArg, ...args1, ...args2);
};

/**
 * 测试
 */
const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
  return 'showUserName'
};

const showUserNameBind = showUserName.myBindByCall(user, '姓名');
const showUserNameBindArrow = showUserName.myBindByCallArrow(user, '姓名');

showUserNameBind('---');
console.log(showUserNameBindArrow('---'));