// // app/api/convert/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { parseHtmlToLayout } from '@/app/lib/parseHtml';

// export async function POST(req: NextRequest) {
//   try {
//     const { html } = await req.json();

//     if (!html) {
//       return NextResponse.json({ error: 'No HTML provided' }, { status: 400 });
//     }

//     const layout = parseHtmlToLayout(html);

//     return NextResponse.json({ layout });
//   } catch (error) {
//     console.error('Error in API:', error);
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }
// api/convert/route.ts
import { NextResponse } from 'next/server';
import { convertRawHtmlToOrgFormat } from '@/app/lib/parseHtml';

export async function POST(req: Request) {
  const { html } = await req.json();

  const layoutJson = convertRawHtmlToOrgFormat(html);

  return NextResponse.json(layoutJson);
}

