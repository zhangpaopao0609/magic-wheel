Function.prototype.myBindPerfect = function(thisArg, ...args1) {
  const fn = this;
  return function BindedFn (...args2) {
    if (new.target === BindedFn) {
      return fn(...args1, ...args2);
    };
    return fn.call(thisArg, ...args1, ...args2)
  };
};

const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
  return 'showUserName'
};

const showUserNameBind = showUserName.myBindPerfect(user, '姓名');

const res = showUserNameBind('---');
console.log(res);

const res_new = new showUserNameBind('---');
