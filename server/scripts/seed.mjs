import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const testEmail = "teste@example.com";
const testPassword = "Teste123!";
const testName = "Usuário de Teste";

const sampleCategories = [
  "Livros",
  "Games",
  "Filmes",
  "Quadrinhos",
  "Colecionáveis",
];

const sampleCustomFields = [
  { fieldName: "Formato", fieldType: "text" },
  { fieldName: "Ano", fieldType: "text" },
  { fieldName: "Estado", fieldType: "text" },
  { fieldName: "Local", fieldType: "text" },
];

const sampleItems = [
  {
    title: "Duna",
    category: "Livros",
    description: "Edicao de capa dura da saga de ficcao cientifica.",
    status: "owned",
    isFavorite: true,
    customData: { Formato: "Capa dura", Ano: "2021", Estado: "Otimo", Local: "Estante sala" },
  },
  {
    title: "Neuromancer",
    category: "Livros",
    description: "Classico cyberpunk que sempre vale revisitar.",
    status: "owned",
    isFavorite: false,
    customData: { Formato: "Brochura", Ano: "2019", Estado: "Bom", Local: "Estante escritorio" },
  },
  {
    title: "Fundacao",
    category: "Livros",
    description: "Volume principal da serie de Isaac Asimov.",
    status: "wishlist",
    isFavorite: true,
    customData: { Formato: "Capa comum", Ano: "2024", Estado: "Procurando", Local: "Wishlist" },
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    category: "Games",
    description: "Midia fisica para Nintendo Switch.",
    status: "owned",
    isFavorite: true,
    customData: { Formato: "Cartucho", Ano: "2017", Estado: "Otimo", Local: "Rack gamer" },
  },
  {
    title: "Hades",
    category: "Games",
    description: "Indie favorito para sessoes curtas e intensas.",
    status: "owned",
    isFavorite: false,
    customData: { Formato: "Digital", Ano: "2023", Estado: "Ativo", Local: "Steam" },
  },
  {
    title: "Chrono Trigger",
    category: "Games",
    description: "Versao que quero adicionar a colecao retro.",
    status: "wishlist",
    isFavorite: false,
    customData: { Formato: "SNES", Ano: "1995", Estado: "Buscando", Local: "Wishlist" },
  },
  {
    title: "Blade Runner 2049",
    category: "Filmes",
    description: "Edicao steelbook com arte especial.",
    status: "owned",
    isFavorite: true,
    customData: { Formato: "Blu-ray", Ano: "2018", Estado: "Lacrado", Local: "Prateleira midia" },
  },
  {
    title: "Akira",
    category: "Filmes",
    description: "Filme de animacao essencial na colecao.",
    status: "loaned",
    isFavorite: false,
    customData: { Formato: "Blu-ray", Ano: "2020", Estado: "Emprestado", Local: "Com Rafael" },
  },
  {
    title: "Interestelar",
    category: "Filmes",
    description: "Edicao especial com extras e livreto.",
    status: "owned",
    isFavorite: false,
    customData: { Formato: "4K UHD", Ano: "2022", Estado: "Otimo", Local: "Prateleira midia" },
  },
  {
    title: "Watchmen",
    category: "Quadrinhos",
    description: "Edicao definitiva em capa dura.",
    status: "owned",
    isFavorite: true,
    customData: { Formato: "Capa dura", Ano: "2020", Estado: "Otimo", Local: "Estante HQ" },
  },
  {
    title: "Sandman Vol. 1",
    category: "Quadrinhos",
    description: "Inicio da colecao de Neil Gaiman.",
    status: "owned",
    isFavorite: false,
    customData: { Formato: "Encadernado", Ano: "2021", Estado: "Bom", Local: "Estante HQ" },
  },
  {
    title: "Batman: O Longo Dia das Bruxas",
    category: "Quadrinhos",
    description: "Uma das historias favoritas do Batman.",
    status: "wishlist",
    isFavorite: false,
    customData: { Formato: "Capa comum", Ano: "2024", Estado: "Procurando", Local: "Wishlist" },
  },
  {
    title: "Funko Pop Homem-Aranha",
    category: "Colecionáveis",
    description: "Figura com caixa em excelente estado.",
    status: "owned",
    isFavorite: false,
    customData: { Formato: "Vinyl", Ano: "2022", Estado: "Otimo", Local: "Vitrine" },
  },
  {
    title: "Action Figure Darth Vader",
    category: "Colecionáveis",
    description: "Escala 1:12 com acessorios completos.",
    status: "loaned",
    isFavorite: false,
    customData: { Formato: "Figure", Ano: "2021", Estado: "Emprestado", Local: "Com Marina" },
  },
  {
    title: "Miniatura DeLorean",
    category: "Colecionáveis",
    description: "Modelo detalhado do carro de De Volta para o Futuro.",
    status: "owned",
    isFavorite: true,
    customData: { Formato: "Die-cast", Ano: "2023", Estado: "Otimo", Local: "Vitrine" },
  },
];

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        name: testName,
        password: hashedPassword,
      },
      create: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
      },
    });

    const categories = {};
    for (const name of sampleCategories) {
      const category = await prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name,
        },
      });
      categories[name] = category;
    }

    for (const field of sampleCustomFields) {
      await prisma.customField.upsert({
        where: {
          userId_fieldName: {
            userId: user.id,
            fieldName: field.fieldName,
          },
        },
        update: {
          fieldType: field.fieldType,
        },
        create: {
          userId: user.id,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
        },
      });
    }

    for (const item of sampleItems) {
      const existingItem = await prisma.item.findFirst({
        where: {
          userId: user.id,
          title: item.title,
          deletedAt: null,
        },
        select: { id: true },
      });

      const data = {
        userId: user.id,
        categoryId: categories[item.category].id,
        title: item.title,
        description: item.description,
        status: item.status,
        isFavorite: item.isFavorite,
        customData: JSON.stringify(item.customData),
      };

      if (existingItem) {
        await prisma.item.update({
          where: { id: existingItem.id },
          data,
        });
      } else {
        await prisma.item.create({ data });
      }
    }

    const [itemCount, categoryCount, customFieldCount] = await Promise.all([
      prisma.item.count({ where: { userId: user.id, deletedAt: null } }),
      prisma.category.count({ where: { userId: user.id } }),
      prisma.customField.count({ where: { userId: user.id } }),
    ]);

    console.log("✅ Conta de desenvolvimento preparada com sucesso!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Categorias: ${categoryCount}`);
    console.log(`   Campos customizados: ${customFieldCount}`);
    console.log(`   Itens: ${itemCount}`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário de teste:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await seed();
