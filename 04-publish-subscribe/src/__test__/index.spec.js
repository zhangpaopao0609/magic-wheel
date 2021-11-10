const pubsub = require('../index');

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

test('订阅 C 和 D 事件并立即发布，发布时传递 2 个参数', () => {
  const message1 = '这是 getMessage 收到的第一个参数';
  const message2 = '这是 getMessage 收到的第二个参数';
  pubsub.on('C', (args) => {
    expect(args).toEqual([message1, message2]);
  });

  pubsub.on('D', (args) => {
    expect(args).toEqual([message1, message2]);
  });
  pubsub.emit('C', message1, message2);
  pubsub.emit('D', message1, message2);
});