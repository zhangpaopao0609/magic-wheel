const user = { name: '张跑跑' };

function showUserName(title) {
  console.log(title, this.name);
};

showUserName('hello:'); // hello: undefined
showUserName.call(user, 'hello:');  // hello: 张跑跑
