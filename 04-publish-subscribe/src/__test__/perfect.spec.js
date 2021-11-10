const pubsub = require('../perfect');

test('订阅 A 事件并立即发布，发布时传递 1 个参数', () => {
  const message = '这是 A 收到的第一个参数';
  pubsub.on('A', (args) => {
    expect(args).toEqual([message]);
  });
  pubsub.emit('A', message);
});

test('订阅 B 事件并立即发布，发布时传递 2 个参数', () => {
  const message1 = '这是 B 收到的第一个参数';
  const message2 = '这是 B 收到的第二个参数';
  pubsub.on('B', (args) => {
    expect(args).toEqual([message1, message2]);
  });
  pubsub.emit('B', message1, message2);
});

test('订阅 C 和 D 事件并立即发布，发布时传递参数', () => {
  const messageC = '这是 C 收到的参数';
  const messageD = '这是 D 收到的参数';
  pubsub.on('C', (args) => {
    expect(args).toEqual([messageC]);
  });

  pubsub.on('D', (args) => {
    expect(args).toEqual([messageD]);
  });
  pubsub.emit('C', messageC);
  pubsub.emit('D', messageD);
});

test('订阅 E 和 F 事件并立即发布，发布后立即取消订阅 E，再次发布 E 和 F 事件', () => {
  let e = 0, f = 0;
  const uuidE = pubsub.on('E', () => e += 1);
  const uuidF = pubsub.on('F', () => f += 1);

  pubsub.emit('E');
  pubsub.emit('F');
  expect(e).toBe(1);
  expect(f).toBe(1);

  pubsub.remove(uuidE);
  pubsub.emit('E');
  pubsub.emit('F');
  expect(e).toBe(1);
  expect(f).toBe(2);

  pubsub.remove(uuidF);
  pubsub.emit('E');
  pubsub.emit('F');
  expect(e).toBe(1);
  expect(f).toBe(2);
});