import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

const regex = /\{\/\* Stats Cards \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?(?=<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">|<motion\.div)/;

// Let's print out what it matches.
const match = content.match(/\{\/\* Stats Cards \*\/\}[\s\S]*?<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/);
if (match) {
  console.log("Matched the cards up to grid-cols-1 lg:grid-cols-3");
} else {
  console.log("Did not match up to grid-cols-1 lg:grid-cols-3");
}

const match2 = content.match(/\{\/\* Stats Cards \*\/\}[\s\S]*?(?=<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">|<motion\.div\s*initial=\{\{ opacity: 0, y: 15 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*transition=\{\{ delay: 0.3 \}\}\s*className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black\/5 flex flex-col justify-between">)/);
if (match2) {
  console.log("Matched up to the chart container");
} else {
  console.log("Did not match up to the chart container");
}
