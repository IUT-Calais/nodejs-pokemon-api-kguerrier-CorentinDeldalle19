import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  try {
    // Supprimer les types existants
    await prisma.type.deleteMany();

    // Créer les types de Pokémon
    await prisma.type.createMany({
      data: [
        { name: 'Normal' },
        { name: 'Fire' },
        { name: 'Water' },
        { name: 'Grass' },
        { name: 'Electric' },
        { name: 'Ice' },
        { name: 'Fighting' },
        { name: 'Poison' },
        { name: 'Ground' },
        { name: 'Flying' },
        { name: 'Psychic' },
        { name: 'Bug' },
        { name: 'Rock' },
        { name: 'Ghost' },
        { name: 'Dragon' },
        { name: 'Dark' },
        { name: 'Steel' },
        { name: 'Fairy' },
      ],
    });

    // Supprimer les utilisateurs existants
    await prisma.user.deleteMany();

    // Créer l'utilisateur administrateur
    const hashedPassword = await bcrypt.hash("admin", 10);
    await prisma.user.create({
      data: { email: "admin@gmail.com", password: hashedPassword },
    });

    console.log("Seed completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();