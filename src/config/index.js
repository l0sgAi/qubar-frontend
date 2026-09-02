// 全局运行时配置：由 Vite 环境变量注入，取值见根目录 .env.development / .env.production
// 所有需要后端地址的地方统一从这里取，不再硬编码域名
export const API_BASE = import.meta.env.VITE_API_BASE
