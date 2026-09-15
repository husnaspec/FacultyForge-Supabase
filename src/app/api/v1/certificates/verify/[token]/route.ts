import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const cert = await dbRepo.verifyCertificate(token);
    if (!cert) {
      return NextResponse.json({ detail: 'Certificate verification failed. Token is invalid or revoked.' }, { status: 404 });
    }
    return NextResponse.json(cert);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
