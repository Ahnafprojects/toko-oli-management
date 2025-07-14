// src/app/api/settings/profile/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak terotentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: validation.data.name },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}