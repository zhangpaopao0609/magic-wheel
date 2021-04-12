let template = "{% if(isShow) { %} <b>{{ name }}</b> {% }else{ %} isShow is false {% } %} {% arr.forEach(item => { %} 11 {% }) %}"

template = template.replace(/\{\{([^}]+)\}\}/g,  ($0, $1) => {
  return "${" + $1.trim() + "}";
});

let head = `let str = ''\nwith(obj){\n`;
head += "str += `";

template = template.replace(/\{\%([^%]+)\%\}/g, ($0, $1) => {
  return "`\n"+$1.trim()+"\nstr+=`";
});


let tail = "`\n}\nreturn str;";

console.log(head + template + tail);

// const fn =  new Function("obj", head + template + tail);
// const res = fn({isShow: true, name: 'arrow', arr: [1]});
// // console.log(res);



const str = "`let str = ''; with(obj) {str += n;} return str`"
const fn = new Function("obj", str);
console.log(fn({ n : 2 }));