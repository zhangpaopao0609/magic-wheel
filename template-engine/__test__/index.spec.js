it("{{}} 表达式", () => {
  const output = compile("<b>{{ name }}</b>")({ name: "tom" });
  expect(output).toBe(`<b>tom</b>`);
});

it("{{}} toUpperCase 表达式", () => {
  const output = compile("<b>{{ name.toUpperCase() }}</b>")({ name: "tom" });
  expect(output).toBe(`<b>TOM</b>`);
});

it("{{}} +连接", () => {
  const output = compile("<b>{{ '[' + name + ']' }}</b>")({ name: "tom" });
  expect(output).toBe(`<b>[tom]</b>`);
});


