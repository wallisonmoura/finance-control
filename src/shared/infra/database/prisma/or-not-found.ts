import { Prisma } from '@prisma/client';

// P2025 on update/delete: no row matched, because it was deleted between the
// use case reading it and this write (e.g. in another tab), or the where
// clause's userId did not match. Turns it into the module's not-found error.
export async function orNotFound<T>(write: Promise<T>, makeError: () => Error): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw makeError();
    }

    throw error;
  }
}
