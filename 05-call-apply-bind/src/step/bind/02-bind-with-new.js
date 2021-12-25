/**
 * 利用 new.target 的机制来判断当前函数是怎么被调用的
 * https://es6.ruanyifeng.com/#docs/class#new-target-%E5%B1%9E%E6%80%A7
 * @param {*} thisArg 
 * @param  {...any} args1 
 * @returns 
 */
Function.prototype.myBind = function(thisArg, ...args1) {
  const fn = this;
  return function BindedFn (...args2) {
    if (new.target === BindedFn) {
      return fn(...args1, ...args2);
    };
    const fnName = Symbol();
    thisArg[fnName] = fn;
    const res = thisArg[fnName](...args1, ...args2);
    delete thisArg[fnName];
    return res;
  };
};

/**
 * 测试
 */
const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
};

const showUserNameBind = showUserName.myBind(user, '姓名');

showUserNameBind('---');
new showUserNameBind('---');
