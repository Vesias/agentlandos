import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const [width, height] = params.dimensions;
    const w = parseInt(width) || 400;
    const h = parseInt(height) || 300;
    
    // Generate a simple SVG placeholder
    const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="#f3f4f6"/>
      <rect x="10" y="10" width="${w-20}" height="${h-20}" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2" rx="8"/>
      <text x="${w/2}" y="${h/2-10}" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="16" font-weight="bold">AGENTLAND</text>
      <text x="${w/2}" y="${h/2+10}" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">${w} × ${h}</text>
    </svg>`;
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}