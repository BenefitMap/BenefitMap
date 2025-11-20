// node_modules 폴더 존재 여부를 체크하고 없으면 npm install 실행
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootNodeModules = path.join(__dirname, 'node_modules');
const frontendNodeModules = path.join(__dirname, 'BenefitMapFrontend', 'node_modules');

const rootExists = fs.existsSync(rootNodeModules);
const frontendExists = fs.existsSync(frontendNodeModules);

if (!rootExists || !frontendExists) {
  console.log('📦 의존성 패키지를 설치합니다...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ 설치가 완료되었습니다!\n');
  } catch (error) {
    console.error('❌ 설치 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 의존성 패키지가 이미 설치되어 있습니다.\n');
}

