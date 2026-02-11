import { NextResponse } from 'next/server';

export async function POST() {
  const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

  if (!HEYGEN_API_KEY) {
    console.error('❌ HEYGEN_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  console.log('🔑 HeyGen API Key found (length:', HEYGEN_API_KEY.length, ')');

  try {
    // HeyGen Streaming API endpoint for token creation
    const url = 'https://api.heygen.com/v1/streaming.create_token';

    console.log('📡 Requesting token from:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      // Some APIs require an empty body for POST requests
      body: JSON.stringify({}),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HeyGen API Error Response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          error: errorData.message || `HeyGen API error: ${response.status}`,
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Token response received. Keys:', Object.keys(data));

    // HeyGen API returns token in data.token according to docs
    // Handle various response formats
    const token = data.data?.token || data.token || data.access_token;

    if (!token) {
      console.error('❌ No token found in response:', data);
      return NextResponse.json(
        { error: 'Token not found in response', responseData: data },
        { status: 500 }
      );
    }

    console.log('✅ Token extracted successfully (length:', token.length, ')');
    return NextResponse.json({ token });

  } catch (error: any) {
    console.error('❌ Error fetching HeyGen token:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch token',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}