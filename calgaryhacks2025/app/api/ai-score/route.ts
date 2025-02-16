import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    
    const response = await fetch('http://151.145.40.57/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': 'Bearer L5oNxYohw9Piaic6WkzrxJhNrCw1Ckmac0KKa9RBKqX3l9INgIeqe4PIgHIO2GWlTxrF0bZkImSBGfV-045G8HbBXZD7MTXbC7g3LipVUEfek8h61bUoZGIYy2yqjbXpZWDfgLceR6R_E_2MCdxbn8Id6G3jHiqLryE0e9d5Vv0'
      },
      body
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI scoring error:', error);
    return NextResponse.json({ error: 'AI scoring failed' }, { status: 500 });
  }
} 