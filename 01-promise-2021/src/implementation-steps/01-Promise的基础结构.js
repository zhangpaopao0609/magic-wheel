class BasicPromise {
  constructor(executor) {
    const resolve = value => {
      console.log('调用了 resolve 会将 value 传递给 then 方法的第一个函数');
    };
    const reject = reason => {
      console.log('调用了 reject 会将 reason 传递给 then 方法的第二函数');
    };
    try {
      executor(resolve, reject);  // 执行此函数时可能出错
    } catch (error) {
      reject(error); 
    };
  };
  
  then(fn1, fn2) {}; // 实例方法
};
