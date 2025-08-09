import { NextRequest, NextResponse } from 'next/server';

// JWT认证中间件
export function middleware(request: NextRequest) {
  // 获取token
  const token = request.cookies.get('token')?.value;
  
  // 判断是否为受保护路由
  if (isProtectedRoute(request.nextUrl.pathname)) {
    // 如果没有token且访问受保护的路由，则重定向到登录页
    if (!token) {
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// 判断是否为受保护路由
function isProtectedRoute(pathname: string): boolean {
  // 定义公开路由
  const publicRoutes = ['/', '/login', '/register'];
  
  // 如果是公开路由，不需要认证
  if (publicRoutes.includes(pathname)) {
    return false;
  }
  
  // 默认其他路由都需要认证
  return true;
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};