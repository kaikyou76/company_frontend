// 用户注册请求类型接口
// 定义了用户注册时需要提交的数据结构
export interface RegisterRequest {
  username: string;        // 用户名（邮箱格式）
  password: string;        // 密码
  confirmPassword: string; // 确认密码
  fullName: string;        // 用户全名
  locationType: string;    // 位置类型（如：office, remote）
  clientLatitude: string;  // 客户端纬度
  clientLongitude: string; // 客户端经度
  departmentId: number;    // 部门ID
  positionId: number;      // 职位ID
  managerId: number;       // 管理者ID
}

// 用户注册响应类型接口
// 定义了用户注册API返回的数据结构
export interface RegisterResponse {
  success: boolean;  // 操作是否成功
  message: string;   // 响应消息
  data?: {           // 可选的成功数据
    id: number;               // 用户ID
    username: string;         // 用户名
    fullName: string;         // 用户全名
    locationType: string;     // 位置类型
    clientLatitude: string | null;   // 客户端纬度
    clientLongitude: string | null;  // 客户端经度
    departmentId: number;             // 部门ID
    positionId: number;               // 职位ID
    managerId: number;                // 管理者ID
    createdAt: string;                // 创建时间
  };
  errors?: Record<string, string[]>; // 可选的错误详情
  csrfError?: boolean;               // CSRF関連エラーフラグ
}

// 用户登录请求类型接口
// 定义了用户登录时需要提交的数据结构
export interface LoginRequest {
  employeeCode: string;  // 员工编号（邮箱格式）
  password: string;      // 密码
}

// 用户登录响应类型接口
// 定义了用户登录API返回的数据结构
export interface LoginResponse {
  success: boolean;      // 操作是否成功
  token?: string;        // 访问令牌
  refreshToken?: string; // 刷新令牌
  expiresIn?: number;    // 过期时间（秒）
  user?: {               // 可选的用户信息
    id: number;              // 用户ID
    name: string;            // 用户名
    departmentId: number;    // 部门ID
    departmentName: string;  // 部门名称
    positionId: number;      // 职位ID
    positionName: string;    // 职位名称
    role: string;            // 用户角色
    locationType: string;    // 位置类型
  };
  message?: string;      // 响应消息
  csrfError?: boolean;   // CSRF関連エラーフラグ
}

// 用户信息类型接口
// 定义了用户信息的数据结构
export interface User {
  id: number;              // 用户ID
  username: string;        // 用户名
  fullName: string;        // 用户全名
  departmentId: number;    // 部门ID
  departmentName: string;  // 部门名称
  positionId: number;      // 职位ID
  positionName: string;    // 职位名称
  role: string;            // 用户角色
  locationType: string;    // 位置类型
}

// CSRF関連の型定義
export interface CsrfTokenResponse {
  success: boolean;
  csrfToken: string;
  expiresIn: number;
  message: string;
}

export interface CsrfErrorResponse {
  success: false;
  message: string;
  code?: string;
}

// 認証状態の型定義
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registerSuccess: boolean;
}