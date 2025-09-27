// // priority: 2000
const $Double = Java.loadClass("java.lang.Double");

const numToInt = (num) => {
    return new $Double(num).intValue();
}