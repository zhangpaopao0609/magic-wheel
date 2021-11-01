/**
 * 节流函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} interval 每隔 interval 这段时间都需要执行一次
 */
function throttle(fn, interval) {
  let record = Date.now();  // 记录前一次调用的时间

  return function(...args) {
    const now = Date.now();
    if (now - record > interval) {  // 当当前时间和上一次调用时间间隔大于间隔时间时，执行回调函数
      fn(...args);
      record = now; // 调用时重新赋值
    };
  };
};