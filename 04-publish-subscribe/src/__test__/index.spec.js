const pubsub = require('../index');

test('订阅 getMessage 事件并立即发布，发布时传递 1 个参数', () => {
  const message = '这是 getMessage 收到的第一个参数';
  pubsub.on('getMessage', (args) => {
    expect(args).toEqual(message);
  });
  pubsub.emit('getMessage', message);
});

test('订阅 getMessage 事件并立即发布，发布时传递 2 个参数', () => {
  const message1 = '这是 getMessage 收到的第一个参数';
  const message2 = '这是 getMessage 收到的第二个参数';
  pubsub.on('getMessage', (...args) => {
    expect(args).toEqual([message1, message2]);
  });
  pubsub.emit('getMessage', message1, message2);
});

test('订阅 getMessage1 和 getMessage2 事件并立即发布，发布时传递 2 个参数', () => {
  const message1 = '这是 getMessage 收到的第一个参数';
  const message2 = '这是 getMessage 收到的第二个参数';
  pubsub.on('getMessage1', (...args) => {
    expect(args).toEqual([message1, message2]);
  });

  pubsub.on('getMessage2', (...args) => {
    expect(args).toEqual([message1, message2]);
  });
  pubsub.emit('getMessage1', message1, message2);
  pubsub.emit('getMessage2', message1, message2);
});