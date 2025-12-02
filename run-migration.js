const { execSync } = require('child_process');

try {
  console.log('Running Prisma db push...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error running migration:', error.message);
  process.exit(1);
}
