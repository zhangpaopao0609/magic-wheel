/**
 * 节流函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} interval 每隔 interval 这段时间都需要执行一次
 */
function throttle(fn, interval) {
  let done = false; // 记录在间隔期间是否调用过回调函数

  return function(...args) {
    if (!done) {  // 在间隔期间没有调用过回调函数
      done = true;  // 在上一次定时器未结束前 done 均为 true，即在这个期间已经调用过一次回调函数了
      setTimeout(() => {  // 利用定时器来执行回调函数
        fn(...args);
        done = false; // 开启下一次执行回调函数的阀门
      }, interval);
    };
  };
};
