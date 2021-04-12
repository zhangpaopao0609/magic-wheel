let templateStr = "{% if(isShow) { %} <b>{{ name }}</b> {% }else{ %} isShow is false {% } %} {% arr.forEach(item => { %} <div>{{ item }}</div> {% }) %}"


// 解析 {{  }}  对应的正则
const reMustache = /\{\{([^}]+)\}\}/g;
// 将 {{ arg }} 直接替换成 ${ arg }
templateStr = templateStr.replace(reMustache,  ($0, $1) => {
  return "${" + $1.trim() + "}";
});

// 解析 {% %} 对应的正则
const reJsScript = /\{\%([^%]+)\%\}/g;
// 首先直接获取到对应的js语句
// 然后因为 js 不可以被包含在模板字符串中，因此需要特殊处理，前添加一个 `, 承接上一个 `， 后利用 str+= ` 来承接下面的字符串
templateStr = templateStr.replace(reJsScript, ($0, $1) => {
  return "`\n"+$1.trim()+"\nstr+=`";
});

const head = "let str = ''\nwith(obj){\nstr += `";
const tail = "`\n}\nreturn str;";
const generatorStr = head + templateStr + tail;
console.log(generatorStr);
const generator =  new Function("obj", generatorStr);

const res1 = generator({isShow: true, name: 'arrow', arr: [1, 2]});
console.log(res1);
// <b>arrow</b>   <div>1</div>  <div>2</div>
const res2 = generator({isShow: false, name: 'arrow', arr: [3, 4]});
console.log(res2);
// isShow is false   <div>3</div>  <div>4</div>