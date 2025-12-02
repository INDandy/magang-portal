const { exec } = require("child_process");
const path = require("path");

const prismaPath = path.join(__dirname, "node_modules", ".bin", "prisma");

exec(`node ${prismaPath} generate`, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});
