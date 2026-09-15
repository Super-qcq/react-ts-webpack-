/* 🌟 告诉 TypeScript：.less 文件可以被 import */
declare module '*.less' {
  const content: Record<string, string>;
  export default content;
}
