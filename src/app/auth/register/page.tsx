// 指定这是一个客户端组件，将在客户端执行
"use client";

// 从react导入useState, useEffect钩子，用于管理组件状态
import { useState, useEffect } from "react";
// 从react-hook-form导入useForm钩子，用于管理表单状态
import { useForm } from "react-hook-form";
// 从next/navigation导入useRouter钩子，用于页面导航
import { useRouter } from "next/navigation";
// 从react-redux导入useDispatch和useSelector钩子，用于与Redux交互
import { useDispatch, useSelector } from "react-redux";
// 从本地store文件导入AppDispatch和RootState类型
import { AppDispatch, RootState } from "@/app/store";
// 从本地store文件导入registerUserAsync异步操作和选择器函数
import {
  registerUserAsync,
  checkUsernameAsync,
  selectLoading,
  selectError,
  selectRegisterSuccess,
  clearError,
  clearRegisterSuccess,
} from "@/app/store";
// 从本地类型定义文件导入RegisterRequest类型
import { RegisterRequest } from "@/app/types/auth";

// 扩展RegisterRequest类型以包含locationType字段
interface ExtendedRegisterRequest extends RegisterRequest {
  locationType: string;
}

// 定义RegisterPage组件
const RegisterPage = () => {
  // 使用useState钩子管理密码可见性状态
  const [showPassword, setShowPassword] = useState(false);
  // 使用useState钩子管理确认密码可见性状态
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 使用useState钩子管理用户名是否可用状态
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  // 使用useState钩子管理用户名检查延迟状态
  const [usernameCheckDebounce, setUsernameCheckDebounce] =
    useState<NodeJS.Timeout | null>(null);
  // 使用useState钩子管理CSRF错误状态
  const [csrfError, setCsrfError] = useState<string | null>(null);

  // 使用react-hook-form的useForm钩子初始化表单
  // register用于注册表单字段
  // handleSubmit用于处理表单提交
  // watch用于观察表单字段值的变化
  // formState包含表单状态信息，如错误
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExtendedRegisterRequest>();
  // 使用useDispatch钩子获取dispatch函数，用于触发Redux actions
  const dispatch = useDispatch<AppDispatch>();
  // 使用useRouter钩子获取router对象，用于页面导航
  const router = useRouter();

  // 使用useSelector钩子从Redux store中选择加载状态
  const loading = useSelector(selectLoading);
  // 使用useSelector钩子从Redux store中选择错误信息
  const error = useSelector(selectError);
  // 使用useSelector钩子从Redux store中选择注册成功状态
  const registerSuccess = useSelector(selectRegisterSuccess);

  // 观察用户名字段的变化
  const username = watch("username");

  // 使用useEffect钩子处理用户名变化
  useEffect(() => {
    // 如果用户名存在且长度大于等于3
    if (username && username.length >= 3) {
      // 清除之前的延迟检查
      if (usernameCheckDebounce) {
        clearTimeout(usernameCheckDebounce);
      }

      // 设置新的延迟检查
      const debounce = setTimeout(async () => {
        try {
          // 派发检查用户名异步操作
          const result = await dispatch(checkUsernameAsync(username));
          // 如果检查成功，更新用户名是否可用状态
          if (checkUsernameAsync.fulfilled.match(result)) {
            const payload = result.payload as any;
            if (payload.csrfError) {
              setCsrfError(
                "セキュリティトークンの検証に失敗しました。ページを再読み込みしてください。"
              );
              setIsUsernameAvailable(null);
            } else {
              setIsUsernameAvailable(payload.available || payload);
            }
          } else if (checkUsernameAsync.rejected.match(result)) {
            // 检查失败时的处理
            const errorPayload = result.payload as any;
            if (errorPayload?.csrfError) {
              setCsrfError(
                "セキュリティトークンの検証に失敗しました。ページを再読み込みしてください。"
              );
            }
            setIsUsernameAvailable(false);
          }
        } catch (error: any) {
          console.error("检查用户名时出错:", error);
          if (
            error.message &&
            (error.message.includes("CSRF") ||
              error.message.includes("セキュリティトークン"))
          ) {
            setCsrfError(
              "セキュリティトークンの検証に失敗しました。ページを再読み込みしてください。"
            );
          }
          setIsUsernameAvailable(false);
        }
      }, 500);

      // 保存延迟检查的引用
      setUsernameCheckDebounce(debounce);
    } else {
      // 如果用户名不存在或长度小于3，重置用户名是否可用状态
      setIsUsernameAvailable(null);
    }

    // 清理函数，组件卸载时清除延迟检查
    return () => {
      if (usernameCheckDebounce) {
        clearTimeout(usernameCheckDebounce);
      }
    };
  }, [username, dispatch]); // 依赖数组：当username变化时重新执行此effect
  // dispatch被包含在依赖数组中是因为React/ESLint规则要求所有在effect中使用的外部函数都被包含在依赖数组中
  // 虽然useDispatch返回的dispatch函数是稳定引用的（不会变化），但为了满足规则仍需包含在依赖数组中
  // 之前usernameCheckDebounce也被包含在依赖数组中，但这导致了无限循环，因为每次effect执行都会设置新的timeout，
  // 而timeout引用的变化又会触发effect重新执行，所以现在我们将其从依赖数组中移除，并在effect内部正确清理

  // 使用useEffect钩子处理注册成功状态
  useEffect(() => {
    // 如果注册成功
    if (registerSuccess) {
      // 3秒后清除注册成功状态并跳转到登录页面
      const timer = setTimeout(() => {
        dispatch(clearRegisterSuccess());
        router.push("/auth/login");
      }, 3000);

      // 清理函数，组件卸载时清除定时器
      return () => clearTimeout(timer);
    }
  }, [registerSuccess, dispatch, router]);

  // 定义表单提交处理函数
  const onSubmit = async (data: RegisterRequest) => {
    // 清除之前的错误信息
    dispatch(clearError());
    setCsrfError(null);

    try {
      // 调用注册异步操作
      const result = await dispatch(registerUserAsync(data));

      // 登録が失敗した場合のCSRFエラーチェック
      if (registerUserAsync.rejected.match(result)) {
        const errorPayload = result.payload as any;
        if (
          errorPayload?.csrfError ||
          (errorPayload?.message &&
            errorPayload.message.includes("セキュリティトークン"))
        ) {
          setCsrfError(
            "セキュリティトークンの検証に失敗しました。ページを再読み込みしてください。"
          );
        }
      }
    } catch (error: any) {
      console.error("注册过程中出错:", error);
      if (
        error.message &&
        (error.message.includes("CSRF") ||
          error.message.includes("セキュリティトークン"))
      ) {
        setCsrfError(
          "セキュリティトークンの検証に失敗しました。ページを再読み込みしてください。"
        );
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
            创建您的账户
          </h2>
        </div>

        {/* 注册表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* 显示成功消息 */}
          {registerSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* 成功图标 */}
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    注册成功！3秒后将跳转到登录页面...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 显示CSRF错误消息 */}
          {csrfError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* 错误图标 */}
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    CSRF 错误
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{csrfError}</p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="font-medium text-red-800 hover:text-red-900"
                      >
                        点击这里重新加载页面
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 显示错误消息 */}
          {error && !csrfError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* 错误图标 */}
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">注册失败</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 表单字段容器 */}
          <div className="rounded-md shadow-sm space-y-4">
            {/* 用户名字段 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                用户名
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  {...register("username", {
                    required: "用户名是必填项",
                    minLength: {
                      value: 3,
                      message: "用户名至少需要3个字符",
                    },
                  })}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="name@company.com"
                />
                {/* 用户名检查状态图标 */}
                {username && username.length >= 3 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isUsernameAvailable === true ? (
                      // 用户名可用图标
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : isUsernameAvailable === false ? (
                      // 用户名不可用图标
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      // 检查中图标
                      <svg
                        className="animate-spin h-5 w-5 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
              {username && username.length < 3 && (
                <p className="mt-1 text-sm text-red-600">
                  用户名至少需要3个字符
                </p>
              )}
              {username &&
                username.length >= 3 &&
                isUsernameAvailable === false && (
                  <p className="mt-1 text-sm text-red-600">
                    用户名不可用或检查失败
                  </p>
                )}
              {username &&
                username.length >= 3 &&
                isUsernameAvailable === true && (
                  <p className="mt-1 text-sm text-green-600">用户名可用</p>
                )}
              {username &&
                username.length >= 3 &&
                isUsernameAvailable === null && (
                  <p className="mt-1 text-sm text-gray-500">
                    正在检查用户名...
                  </p>
                )}
            </div>

            {/* 密码字段 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "密码是必填项",
                    minLength: {
                      value: 6,
                      message: "密码至少需要6个字符",
                    },
                  })}
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
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    // 眼睛关闭图标
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 确认密码字段 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                确认密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "请确认密码",
                    validate: (value, formValues) =>
                      value === formValues.password || "密码不匹配",
                  })}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="确认密码"
                />
                {/* 确认密码可见性切换按钮 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    // 眼睛打开图标
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    // 眼睛关闭图标
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 全名字段 */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                全名
              </label>
              <input
                id="fullName"
                {...register("fullName", { required: "全名是必填项" })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="张三"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* 位置类型字段 */}
            <div>
              <label
                htmlFor="locationType"
                className="block text-sm font-medium text-gray-700"
              >
                工作地点类型
              </label>
              <select
                id="locationType"
                {...register("locationType", {
                  required: "工作地点类型是必填项",
                })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">请选择工作地点类型</option>
                <option value="office">办公室</option>
                <option value="client">远程</option>
              </select>
              {errors.locationType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.locationType.message}
                </p>
              )}
            </div>
          </div>

          {/* 注册按钮 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                // 加载状态显示
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  注册中...
                </>
              ) : (
                // 正常状态显示
                "注册"
              )}
            </button>
          </div>
        </form>

        {/* 登录链接 */}
        <div className="text-center">
          <button
            onClick={() => router.push("/auth/login")}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            已有账户？立即登录
          </button>
        </div>
      </div>
    </div>
  );
};

// 导出RegisterPage组件作为默认导出
export default RegisterPage;
