import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/security/password";

async function seed() {
  try {
    const testEmail = "teste@example.com";
    const testPassword = "Teste123!";
    const testName = "Usuário de Teste";

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log(`✅ Usuário '${testEmail}' já existe`);
      return;
    }

    // Criar usuário de teste
    const hashedPassword = await hashPassword(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
      },
    });

    console.log("✅ Usuário de teste criado com sucesso!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   Nome: ${user.name}`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário de teste:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
