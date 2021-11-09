const compiler = require('../src/index');

it("解析 {{  }}", () => {
  const output = compiler("<h1>{{ name }}</h1>")({ name: "arrow" });
  expect(output).toBe(`<h1>arrow</h1>`);
});

it("{{}} toUpperCase 表达式", () => {
  const output = compiler("<h1>{{ name.toUpperCase() }}</h1>")({ name: "arrow" });
  expect(output).toBe(`<h1>ARROW</h1>`);
});

it("{% %} js  语句", () => {
  const output = compiler("{% arr.forEach(item => { %}<div>{{ item }}</div>{% }) %}")({ arr: [1, 2] });
  expect(output).toBe(`<div>1</div><div>2</div>`);
});