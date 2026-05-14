/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BAIDU_API_KEY: string
  readonly VITE_BAIDU_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 