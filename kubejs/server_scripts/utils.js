// // priority: 2000
const $Double = Java.loadClass("java.lang.Double");
const $StructureQuill = Java.loadClass("com.tonywww.slashblade_sendims.items.StructureQuill");

const numToInt = (num) => {
    return new $Double(num).intValue();
}