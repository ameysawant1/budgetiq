import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';

interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

// Mock exchange rates - in production, you'd fetch from a real API
const getExchangeRates = async (base: string = 'USD') => {
  // This would typically call an external API like exchangerate-api.com
  // For now, using mock data
  const mockRates: Record<string, Record<string, number>> = {
    USD: {
      INR: 83.5,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.2,
      CAD: 1.35,
      AUD: 1.52,
      CHF: 0.88,
      CNY: 7.25
    },
    INR: {
      USD: 0.012,
      EUR: 0.011,
      GBP: 0.0095,
      JPY: 1.8,
      CAD: 0.016,
      AUD: 0.018,
      CHF: 0.011,
      CNY: 0.087
    },
    EUR: {
      USD: 1.09,
      INR: 90.8,
      GBP: 0.86,
      JPY: 163.5,
      CAD: 1.47,
      AUD: 1.65,
      CHF: 0.96,
      CNY: 7.9
    }
  };

  return {
    base,
    rates: mockRates[base] || mockRates.USD,
    lastUpdated: new Date().toISOString()
  };
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') || 'USD';

    const rates = await getExchangeRates(base);

    return NextResponse.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}