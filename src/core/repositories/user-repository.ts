import { prisma } from "@/lib/prisma";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  image?: string;
}

export class UserRepository {
  static async createUser(input: CreateUserInput) {
    const email = input.email.toLowerCase().trim();
    return prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash: input.passwordHash,
        image: input.image,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        preference: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        preference: true,
      },
    });
  }

  static async updateOnboardingStatus(userId: string, isOnboarded: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isOnboarded },
    });
  }
}
