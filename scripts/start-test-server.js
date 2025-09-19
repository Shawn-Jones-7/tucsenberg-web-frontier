#!/usr/bin/env node

/**
 * 测试服务器启动脚本
 *
 * 专门为 E2E 测试启动开发服务器，确保：
 * 1. React Scan 被禁用以避免测试干扰
 * 2. 其他开发工具被适当配置
 * 3. 测试环境变量被正确设置
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestServerManager {
  constructor() {
    this.serverProcess = null;
    this.isShuttingDown = false;
  }

  /**
   * 设置测试环境变量
   */
  setupTestEnvironment() {
    console.log('🧪 Setting up test environment...');

    // 设置测试环境变量
    process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN = 'true';
    process.env.NEXT_PUBLIC_DISABLE_DEV_TOOLS = 'true';
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    process.env.PLAYWRIGHT_TEST = 'true';

    console.log('   ✅ NEXT_PUBLIC_DISABLE_REACT_SCAN=true');
    console.log('   ✅ NEXT_PUBLIC_DISABLE_DEV_TOOLS=true');
    console.log('   ✅ NEXT_PUBLIC_TEST_MODE=true');
    console.log('   ✅ PLAYWRIGHT_TEST=true');
  }

  /**
   * 启动开发服务器
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting test server...');

      this.setupTestEnvironment();

      // 启动 Next.js 开发服务器
      this.serverProcess = spawn('pnpm', ['dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // 确保测试环境变量被传递
          NEXT_PUBLIC_DISABLE_REACT_SCAN: 'true',
          NEXT_PUBLIC_TEST_MODE: 'true',
        },
      });

      let serverReady = false;
      let output = '';

      this.serverProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 检查服务器是否准备就绪
        if (text.includes('Ready') || text.includes('localhost:3000')) {
          if (!serverReady) {
            serverReady = true;
            console.log('✅ Test server is ready');
            resolve(this.serverProcess);
          }
        }

        // 输出服务器日志（过滤掉噪音）
        if (!text.includes('webpack') && !text.includes('Compiled')) {
          process.stdout.write(text);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const text = data.toString();

        // 过滤掉已知的无害警告
        if (
          !text.includes('ExperimentalWarning') &&
          !text.includes('punycode') &&
          !text.includes('deprecated')
        ) {
          process.stderr.write(text);
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ Failed to start test server:', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (!this.isShuttingDown) {
          console.log(`🔄 Test server exited with code ${code}`);
        }
      });

      // 超时处理
      setTimeout(() => {
        if (!serverReady) {
          console.error('❌ Test server failed to start within timeout');
          reject(new Error('Server startup timeout'));
        }
      }, 30000); // 30秒超时
    });
  }

  /**
   * 停止服务器
   */
  async stopServer() {
    if (this.serverProcess && !this.isShuttingDown) {
      console.log('🛑 Stopping test server...');
      this.isShuttingDown = true;

      this.serverProcess.kill('SIGTERM');

      // 等待进程结束
      await new Promise((resolve) => {
        this.serverProcess.on('exit', resolve);

        // 强制结束超时
        setTimeout(() => {
          if (this.serverProcess) {
            this.serverProcess.kill('SIGKILL');
          }
          resolve(null);
        }, 5000);
      });

      console.log('✅ Test server stopped');
    }
  }

  /**
   * 验证服务器状态
   */
  async verifyServer(url = 'http://localhost:3000') {
    console.log(`🔍 Verifying server at ${url}...`);

    try {
      const response = await fetch(url);
      const isHealthy = response.ok;

      if (isHealthy) {
        console.log('✅ Server is healthy');

        // 检查响应中是否包含 React Scan 相关内容
        const html = await response.text();
        const hasReactScan =
          html.includes('react-scan') || html.includes('React Scan');

        if (hasReactScan) {
          console.warn('⚠️  Server response contains React Scan content');
          return { healthy: true, hasInterference: true };
        }
        console.log('✅ Server response is clean (no React Scan content)');
        return { healthy: true, hasInterference: false };
      }
      console.error(`❌ Server returned status ${response.status}`);
      return { healthy: false, hasInterference: false };
    } catch (error) {
      console.error('❌ Server verification failed:', error.message);
      return { healthy: false, hasInterference: false };
    }
  }

  /**
   * 完整的测试服务器生命周期管理
   */
  async runWithServer(testFunction) {
    try {
      await this.startServer();

      // 等待服务器完全启动
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 验证服务器状态
      const status = await this.verifyServer();
      if (!status.healthy) {
        throw new Error('Server is not healthy');
      }

      if (status.hasInterference) {
        console.warn(
          '⚠️  Detected potential interference, but proceeding with tests',
        );
      }

      // 运行测试函数
      await testFunction();
    } finally {
      await this.stopServer();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const manager = new TestServerManager();

  // 处理退出信号
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    await manager.stopServer();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    await manager.stopServer();
    process.exit(0);
  });

  // 启动服务器并保持运行
  manager
    .startServer()
    .then(() => {
      console.log('🎯 Test server is running. Press Ctrl+C to stop.');
    })
    .catch((error) => {
      console.error('❌ Failed to start test server:', error);
      process.exit(1);
    });
}

module.exports = TestServerManager;
