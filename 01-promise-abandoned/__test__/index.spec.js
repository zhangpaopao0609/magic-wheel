const { BasePromise, FullPromise  } = require("../index");

it('基础版Promise返回成功测试', done => {
  const p = new BasePromise((resolve, reject) => {
    setTimeout(() => {
      resolve('success')
    }, 100);
  });

  p.then(res => {
    expect(res).toBe('success');
    done();
  });
});

it('基础版Promise返回失败测试', done => {
  const p = new BasePromise((resolve, reject) => {
    setTimeout(() => {
      reject('failed')
    }, 100);
  });

  p.then(res => {
    console.log('resolve res: ', res)
  }, err => {
    expect(err).toBe('failed');
    done();
  });
});

it('基础版Promise返回失败catch测试', done => {
  const p = new BasePromise((resolve, reject) => {
    setTimeout(() => {
      reject('failed')
    }, 100);
  });

  p.catch(err => {
    expect(err).toBe('failed');
    done();
  });
});

it('完整版 Promise 返回成功测试', done => {
  const p = new FullPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('success')
    }, 100);
  });

  p.then().then().then(res => {
    expect(res).toBe('success');
    done();
  })
});

it('完整版 Promise 返回失败测试', done => {
  const p = new FullPromise((resolve, reject) => {
    setTimeout(() => {
      reject('failed')
    }, 100);
  });

  p.then().then().then(res => {
    console.log(res);
  },err => {
    expect(err).toBe('failed');
    done();
  })
});