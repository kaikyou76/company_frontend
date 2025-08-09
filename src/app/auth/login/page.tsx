// 指定这是一个客户端组件，将在客户端执行
'use client';

// 从react导入useState钩子，用于管理组件状态
import { useState } from 'react';
// 从react-hook-form导入useForm钩子，用于管理表单状态
import { useForm } from 'react-hook-form';
// 从next/navigation导入useRouter钩子，用于页面导航
import { useRouter } from 'next/navigation';
// 从react-redux导入useDispatch和useSelector钩子，用于与Redux交互
import { useDispatch, useSelector } from 'react-redux';
// 从本地store文件导入AppDispatch和RootState类型
import { AppDispatch, RootState } from '@/app/store';
// 从本地store文件导入loginUserAsync异步操作和选择器函数
import { loginUserAsync, selectLoading, selectError, clearError } from '@/app/store';
// 从本地类型定义文件导入LoginRequest类型
import { LoginRequest } from '@/app/types/auth';

// 定义LoginPage组件
const LoginPage = () => {
  // 使用useState钩子管理密码可见性状态
  const [showPassword, setShowPassword] = useState(false);
  
  // 使用react-hook-form的useForm钩子初始化表单
  // register用于注册表单字段
  // handleSubmit用于处理表单提交
  // formState包含表单状态信息，如错误
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  // 使用useDispatch钩子获取dispatch函数，用于触发Redux actions
  const dispatch = useDispatch<AppDispatch>();
  // 使用useRouter钩子获取router对象，用于页面导航
  const router = useRouter();
  
  // 使用useSelector钩子从Redux store中选择加载状态
  const loading = useSelector(selectLoading);
  // 使用useSelector钩子从Redux store中选择错误信息
  const error = useSelector(selectError);
  
  // 定义表单提交处理函数
  const onSubmit = async (data: LoginRequest) => {
    // 清除之前的错误信息
    dispatch(clearError());
    
    // 调用登录异步操作
    const result = await dispatch(loginUserAsync(data));
    
    // 如果登录成功，跳转到仪表板页面
    if (loginUserAsync.fulfilled.match(result)) {
      if (result.payload.success) {
        router.push('/dashboard');
      }
    }
  };
  
  // 渲染组件UI
  return (
    // 最外层容器，使用Tailwind CSS类设置样式
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      {/* 内容容器 */}
      <div className="max-w-md w-full space-y-8">
        {/* 标题区域 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到您的账户
          </h2>
        </div>
        
        {/* 登录表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* 显示错误消息 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* 错误图标 */}
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    登录失败
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {error.split('\n').map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => dispatch(clearError())}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 表单字段容器 */}
          <div className="rounded-md shadow-sm space-y-4">
            {/* 员工编号/用户名字段 */}
            <div>
              <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">
                员工编号
              </label>
              <input
                id="employeeCode"
                {...register('employeeCode', { required: '员工编号是必填项' })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="name@company.com"
              />
              {errors.employeeCode && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeCode.message}</p>
              )}
            </div>
            
            {/* 密码字段 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: '密码是必填项' })}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="密码"
                />
                {/* 密码可见性切换按钮 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // 眼睛打开图标
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    // 眼睛关闭图标
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>
          
          {/* 忘记密码链接 */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                忘记密码?
              </a>
            </div>
          </div>
          
          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                // 加载状态显示
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </>
              ) : (
                // 正常状态显示
                '登录'
              )}
            </button>
          </div>
        </form>
        
        {/* 注册链接 */}
        <div className="text-center">
          <button
            onClick={() => router.push('/auth/register')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            没有账户？立即注册
          </button>
        </div>
      </div>
    </div>
  );
};

// 导出LoginPage组件作为默认导出
export default LoginPage;