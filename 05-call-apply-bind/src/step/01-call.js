Function.prototype.myCall = function(thisArg) {
  // 1. 此处的 this 同样为隐式绑定，指向的是调用这个方法的那个函数，例如 showUserName.myCall(user)， 此处的 this 就是 showUserName 
  // 2. 将 this （也就是 showUserName 这个函数）赋值给 thisArg 的 fnName 属性，
  // 此时， this.fnName = function() { console.log(this.name) }
  thisArg.fnName = this;
  // 3. 调用 thisArg.fnName(), 由于隐式绑定了 this，此时的 this 指向了 thisArg
  return thisArg.fnName();
};

const user = { name: '张跑跑' };

function showUserName() {
  console.log(this.name);
};

showUserName();  // undefined
showUserName.myCall(user);  // 张跑跑