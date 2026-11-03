const fs = require("fs");
fs.writeFileSync("dist/core.d.ts", 'export * from "./core/index";\n');
fs.writeFileSync("dist/react.d.ts", 'export * from "./core/react/index";\n');
console.log("Generated forwarding d.ts files for dist/core and dist/react");
