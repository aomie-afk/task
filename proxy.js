import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'vortex-task-secret-key-1234567890';
const encodedKey = new TextEncoder().encode(secretKey);

export async function decrypt(session = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  
  // 1. Check if path is public or API
  const isPublicRoute = ['/login', '/signup'].includes(path);
  const isApiRoute = path.startsWith('/api');
  
  if (isApiRoute) return NextResponse.next();
  
  // 2. Get session cookie
  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // 3. Redirect to /login if not authenticated and path is not public
  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 4. Redirect to / if authenticated and trying to access login/signup
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Routes that Proxy should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
