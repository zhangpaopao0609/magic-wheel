require('../myCall.js');

const obj = {
  name: 'paopao',
};

function getName(title, separator) {
  return `${title}${separator}${this.name}`;
};

test('myCall 显示绑定函数 this', () => {
  const res = getName.myCall(obj, '张跑跑', '----');
  const expectRes = getName.call(obj, '张跑跑', '----');
  expect(res).toEqual(expectRes);
});
