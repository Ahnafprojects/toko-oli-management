import "next-auth/jwt";
import "next-auth";

declare module "next-auth" {
  /**
   * Tipe `Session` yang dikembalikan oleh `useSession`, `getSession`, dll.
   */
  interface Session {
    user: {
      /** ID unik pengguna dari database Anda. */
      id: string;
      /** Role pengguna (misalnya, 'admin' atau 'user'). */
      role: string;
      // Menggabungkan dengan properti user bawaan (name, email, image)
    } & DefaultSession["user"];
  }

  /**
   * Tipe `User` yang digunakan saat otorisasi atau di dalam adapter.
   */
  interface User {
    /** Role pengguna (misalnya, 'admin' atau 'user'). */
    role: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Tipe token JWT yang dikembalikan oleh callback `jwt`.
   */
  interface JWT {
    /** ID unik pengguna dari database Anda. */
    id: string;
    /** Role pengguna (misalnya, 'admin' atau 'user'). */
    role: string;
  }
}