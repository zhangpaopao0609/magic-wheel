/**
 * 节流函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} interval 每隔 interval 这段时间都需要执行一次
 */
function throttle(fn, interval) {
  let done = false;

  return function(...args) {
    if (done) {
      done = true;
    } else {
      setTimeout(() => {
        fn(...args);
        done = false;
      }, interval);
    }
  }
};