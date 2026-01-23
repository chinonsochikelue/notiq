
const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, '../src/styles');
const files = fs.readdirSync(stylesDir);

let hasError = false;

for (const file of files) {
    if (file.endsWith('.css')) {
        const filePath = path.join(stylesDir, file);
        const css = fs.readFileSync(filePath, 'utf8');
        // Check if the file content is wrapped in a layer, or if it imports tailwind with a layer
        // Simple heuristic: must contain "@layer notiq"
        if (!css.includes('@layer notiq')) {
            console.error(`Error: ${file} is missing "@layer notiq" wrapper.`);
            hasError = true;
        } else {
            console.log(`✅ ${file} is correctly layered.`);
        }
    }
}

if (hasError) {
    process.exit(1);
}
