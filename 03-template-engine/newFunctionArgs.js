// 这样实现是可以的，但是这需要把需要的参数都改造成 obj..
const str1 = "console.log(obj.m, obj.n)";
const fn1 = new Function('obj', str1);
fn1({m: 1, n: 2});
// 1 2

// 如果能直接写 m, n 就好了
// JS 中提供了一个方法， with(obj), 将 with 块中的作用域指向了 obj
// 也就是说， with(obj) { console.log(m, n) } 中的 m, n 不再指向 window, 而是 obj了
const str2 = "with(obj) { console.log(m, n) }";
const fn2 = new Function('obj', str2);
fn2({m: 1, n: 2});
// 1 2
