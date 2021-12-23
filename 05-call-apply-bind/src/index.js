function showProfileMessage(message) {
  console.log(message, this.name);
 }
 const obj = {
  name: "Ankur Anand"
 };
 showProfileMessage.call(obj, "welcome ");

 Function.prototype.myOwnCall = function(someOtherThis, ...args) {
  someOtherThis.fnName = this;
  someOtherThis.fnName(...args);
}

showProfileMessage.myOwnCall(obj, "welcome ");