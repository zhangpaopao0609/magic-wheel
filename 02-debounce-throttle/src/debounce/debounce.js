/**
 * 防抖函数
 * @param {*} fn 需要执行的事件（操作）
 * @param {*} delay 停止触发事件多久后真正执行回调
 */
function debounce(fn, delay) {
  let timer = null; // 闭包私有变量记录定时器

  return function (...args) { // 回调函数的参数接收
    clearTimeout(timer);  // 清除定时器，不论是否存在上一个定时器，直接清除
    timer = setTimeout(() => fn(...args), delay); // 创建新的定时器
  };
};
