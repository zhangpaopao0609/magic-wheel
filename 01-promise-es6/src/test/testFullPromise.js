const FullPromise = require('../FullPromise');

FullPromise.defer = FullPromise.deferred = function(){
  let dfd = {};
  dfd.promise = new FullPromise((resolve, reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
  });
  return dfd;
};

module.exports =  FullPromise;