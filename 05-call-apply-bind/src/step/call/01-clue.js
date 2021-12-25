const user_ = { name: '张跑跑' };

function showUserName_(title) {
  console.log(title, this.name);
};
// 使用 call 来显示地绑定 showUserName_ 在被调用时 this 的指向
showUserName_.call(user_, 'hello:');  // 打印结果： hello: 张跑跑


const user = {
  name: '张跑跑',
  fnName: function showUserName(title) {
    console.log(title, this.name);
  },
};
// 利用隐式绑定规则来实现 showUserName 在被调用时 this 的绑定
user.fnName('hello:');  // 打印结果： hello: 张跑跑
