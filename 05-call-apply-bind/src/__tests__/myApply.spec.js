require('../myApply.js');

const obj = {
  name: 'paopao',
};

function getName(title, separator) {
  return `${title}${separator}${this.name}`;
};

test('myApply 显示绑定函数 this', () => {
  const res = getName.myApply(obj, ['张跑跑', '----']);
  const expectRes = getName.apply(obj, ['张跑跑', '----']);
  expect(res).toEqual(expectRes);
});
