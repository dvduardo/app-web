#!/usr/bin/env node

const { execSync } = require('child_process');

async function start() {
  try {
    console.log('🔄 Rodando migrations do Prisma...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Migrations concluídas!');
    console.log('🚀 Iniciando servidor Next.js...\n');
    
    // Inicia o servidor Next.js e mantém o processo ativo
    execSync('next start', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (error) {
    console.error('❌ Erro durante inicialização:', error.message);
    process.exit(1);
  }
}

start();
