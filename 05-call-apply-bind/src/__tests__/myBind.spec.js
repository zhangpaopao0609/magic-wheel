require('../myBind.js');

const obj = {
  name: 'paopao',
};

function getName(title, separator) {
  return `${title}${separator}${this.name}`;
};

test('myBind 显示绑定函数 this', () => {
  const bindFn = getName.myBind(obj, '张跑跑');
  const res = bindFn('---')
  const expectRes = '张跑跑---paopao';
  expect(res).toEqual(expectRes);
});
