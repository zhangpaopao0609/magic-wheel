/**
 * 基础版 myCall
 * @param {*} fn 要显示绑定 this 的函数
 * @param {*} thisArg fn 被调用时 this 指向的对象（this 要绑定的对象）
 * @param  {...any} args 传递给 fn 的参数列表
 * @returns 返回 fn 执行后的结果
 */
function myCall(fn, thisArg, ...args) {
  const fnName = Symbol();	// 将是独一无二的值
  thisArg[fnName] = this;
  const res = thisArg[fnName](...args);
  delete thisArg[fnName];
  return res;
};

const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
};

myCall(showUserName, user, 'hello:');

