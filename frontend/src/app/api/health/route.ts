import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1';
  let backendStatus = 'UNKNOWN';

  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:3000' }
    });
    backendStatus = res.ok || res.status === 200 || res.status === 405 ? 'ONLINE' : `HTTP_${res.status}`;
  } catch {
    backendStatus = 'OFFLINE_OR_UNREACHABLE';
  }

  return NextResponse.json({
    status: 'UP',
    framework: 'Next.js 16 (App Router)',
    typescript: true,
    timestamp: new Date().toISOString(),
    backend: {
      url: backendUrl,
      status: backendStatus
    }
  });
}
