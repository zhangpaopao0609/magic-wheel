function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    if (timer) {  // 存在上一个 timer
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    } else {  // 不存在上一个 timer 
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    }
  };
};
