let templateStr = "{% if(isShow) { %} <b>{{ name }}</b> {% }else{ %} isShow is false {% } %} {% arr.forEach(item => { %} 11 {% }) %}"


// 解析 {{  }}  对应的正则
const reMustache = /\{\{([^}]+)\}\}/g;
// 将 {{ arg }} 直接替换成 ${ arg }
templateStr = templateStr.replace(reMustache,  ($0, $1) => {
  return "${" + $1.trim() + "}";
});

let head = `let str = ''\nwith(obj){\n`;
head += "str += `";

// 解析 {% %} 对应的正则
const reJsScript = /\{\%([^%]+)\%\}/g;
// 首先直接获取到对应的js语句
// 然后因为 js 不可以被包含在模板字符串中，因此需要特殊处理，前添加一个 `, 承接上一个 `， 后利用 str+= ` 来承接下面的字符串
templateStr = templateStr.replace(reJsScript, ($0, $1) => {
  return "`\n"+$1.trim()+"\nstr+=`";
});

let tail = "`\n}\nreturn str;";

console.log(head + template + tail);

// const fn =  new Function("obj", head + template + tail);
// const res = fn({isShow: true, name: 'arrow', arr: [1]});
// // console.log(res);



