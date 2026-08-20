import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const target = `          // Exclude AirPods Max as requested
          if (name.toLowerCase().includes('airpods max')) {`;

const replacement = `          // Exclude AirPods Max and Plugtech bags/sleeves as requested
          const lowerName = name.toLowerCase();
          if (lowerName.includes('airpods max') || lowerName.includes('sleeve') || lowerName.includes('backpack')) {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('server.ts', content);
    console.log("Successfully added exclusion rules to server.ts");
} else {
    console.log("Could not find the target string.");
}
