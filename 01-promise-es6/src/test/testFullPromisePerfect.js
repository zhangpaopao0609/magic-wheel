const FullPromisePerfect = require('../FullPromisePerfect');

FullPromisePerfect.defer = FullPromisePerfect.deferred = function(){
  let dfd = {};
  dfd.promise = new FullPromisePerfect((resolve, reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
  });
  return dfd;
};

module.exports =  FullPromisePerfect;