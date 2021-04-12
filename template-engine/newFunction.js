const str = "let str = ''; with(obj) {str += n;} return str"
const fn = new Function("obj", str);
console.log(fn)

// ƒ anonymous(obj) {
//   let str = ''; 
//   with(obj) {str += n;} 
//   return str
// }
console.log(fn({ n : 2 }));