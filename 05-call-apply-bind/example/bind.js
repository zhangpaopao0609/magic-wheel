const user = { name: '张跑跑' };

function showUserName(title, separator) {
  console.log(title, separator, this.name);
};

const showUserNameBindUser = showUserName.bind(user, 'Hello');
showUserNameBindUser('--');
