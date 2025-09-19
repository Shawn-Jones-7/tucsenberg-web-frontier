// 测试文件，包含一些魔法数字
export const testFunction = () => {
  const timeout = 5000; // 应该被替换为 TIMEOUT_DEFAULT
  const maxRetries = 3; // 应该被替换为 MAX_RETRIES_DEFAULT
  const bufferSize = 1024; // 应该被替换为 BUFFER_SIZE_KB

  return {
    timeout,
    maxRetries,
    bufferSize,
  };
};

export const anotherFunction = () => {
  const delay = 100; // 应该被替换为 DELAY_MS_SHORT
  const port = 8080; // 应该被替换为 PORT_HTTP_ALT

  return { delay, port };
};
