// tRPCサーバー設定
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response('Method not allowed', { status: 405 });
}

export async function POST(request: NextRequest) {
  // TODO: tRPC実装
  return new Response('Not implemented', { status: 501 });
}
