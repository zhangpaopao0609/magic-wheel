/**
 * 节流函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} interval 每隔 interval 这段时间都需要执行一次
 */
function throttle(fn, interval) {
  let time = Date.now();

  return function(...args) {
    const i = Date.now();
    if (i - time < interval) {
      return;
    } else {
      fn(...args);
      time = i;
    }
  }
}