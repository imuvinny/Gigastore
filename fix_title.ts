import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// The place where the name is extracted is: const name = item.title;
const target = 'const name = item.title;';
const replacement = `let name = item.title;
      // Remove the word "Plug" (case-insensitive) from the title
      if (name) {
        name = name.replace(/plug\\s*-\\s*/i, '');
        name = name.replace(/\\bplug\\b/ig, '').trim();
      }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('server.ts', content);
  console.log('Successfully updated title extraction logic');
} else {
  console.log('Could not find target string in server.ts');
  // fallback search
  const regex = /const name = (item|product)\.title;/;
  if (regex.test(content)) {
     content = content.replace(regex, `let name = $1.title;
      if (name) {
        name = name.replace(/plug\\s*-\\s*/i, '');
        name = name.replace(/\\bplug\\b/ig, '').trim();
      }`);
     fs.writeFileSync('server.ts', content);
     console.log('Successfully updated title extraction logic using fallback regex');
  }
}
