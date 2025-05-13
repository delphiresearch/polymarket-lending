import { NextRequest, NextResponse } from 'next/server';
import { IndexStatus } from '../../../../../packages/index-composer/src/types';

import { indices } from '../route';

export async function GET(request: NextRequest) {
  try {
    const liveIndices = indices.filter(index => index.status === IndexStatus.OPEN);
    return NextResponse.json(liveIndices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
