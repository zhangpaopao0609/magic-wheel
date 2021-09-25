const str1 = "let str = 1; return str"
const fn1 = new Function(str1);
console.log(fn1());
// 1

// let str = 1; return str 是一个 JS 语句，如果添加了 ``，肯定会识别成字符串
const str2 = "`let str = 1; return str`"
const fn2 = new Function(str2);
console.log(fn2());
// undefined

// 这里一部分是JS语句，一部分是模板字符
const str3 = "let str = 1; with(obj) { str += `${count}` } return str;"
const fn3 = new Function('obj' ,str3);
console.log(fn3({ count: 2 }));
// 12