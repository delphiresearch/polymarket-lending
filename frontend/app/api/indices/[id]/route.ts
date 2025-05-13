import { NextRequest, NextResponse } from 'next/server';
import { indices } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const index = indices.find(index => index.id === id);
    
    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }
    
    return NextResponse.json(index);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
