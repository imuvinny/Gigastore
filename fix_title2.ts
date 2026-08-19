import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Use a more robust replacement for name
const regex = /const name = item\.title;/g;
if (regex.test(content)) {
     content = content.replace(regex, `let name = item.title;
          // Remove the word "Plug" (case-insensitive) from the title
          if (name) {
            name = name.replace(/plug\\s*-\\s*/ig, '');
            name = name.replace(/\\bplug\\b/ig, '').trim();
          }`);
     fs.writeFileSync('server.ts', content);
     console.log('Successfully updated title extraction logic using regex');
} else {
    console.log('Could not find const name = item.title;');
}
