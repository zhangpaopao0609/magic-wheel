require('../myCall.js');

const obj = {
  name: 'paopao',
};

function getName(title, separator) {
  return `${title}${separator}${this.name}`;
};

test('myCall 显示绑定函数 this', () => {
  const res = getName.myCall(obj, '张跑跑', '----');
  const expectRes = '张跑跑----paopao';
  expect(res).toEqual(expectRes);
});
