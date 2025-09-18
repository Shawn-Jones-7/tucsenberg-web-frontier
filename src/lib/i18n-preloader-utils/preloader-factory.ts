/**
 * 预加载器工厂类
 * Preloader Factory Class
 */

import { ONE } from "@/constants";
import type { CacheStorage, MetricsCollector } from '@/lib/i18n-cache-types';
import { TranslationPreloader } from '@/lib/i18n-preloader-core';
import type { Messages } from '@/types/i18n';
import type {
  IPreloader,
  PreloaderConfig,
  PreloaderPlugin,
  PreloadEventHandler,
} from '@/lib/i18n-preloader-types';

/**
 * 预加载器工厂类
 * Preloader factory class
 */
export class PreloaderFactory {
  private static instance: PreloaderFactory;
  private plugins = new Map<string, PreloaderPlugin>();
  private eventHandlers = new Map<string, PreloadEventHandler[]>();

  private constructor() {
    // Ensure non-empty body for lint; Map is new so clear is a no-op.
    this.plugins.clear();
  }

  /**
   * 获取工厂实例
   * Get factory instance
   */
  static getInstance(): PreloaderFactory {
    if (!PreloaderFactory.instance) {
      PreloaderFactory.instance = new PreloaderFactory();
    }
    return PreloaderFactory.instance;
  }

  /**
   * 创建预加载器
   * Create preloader
   */
  createPreloader(
    cache: CacheStorage<Messages>,
    metricsCollector: MetricsCollector,
    config?: Partial<PreloaderConfig>,
  ): IPreloader {
    const preloader = new TranslationPreloader(cache, metricsCollector, config);

    // 安装插件
    this.plugins.forEach((plugin) => {
      plugin.install(preloader);
    });

    // 设置事件处理器
    this.setupEventHandlers(preloader);

    return preloader;
  }

  /**
   * 注册插件
   * Register plugin
   */
  registerPlugin(plugin: PreloaderPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * 卸载插件
   * Unregister plugin
   */
  unregisterPlugin(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * 获取插件
   * Get plugin
   */
  getPlugin(name: string): PreloaderPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 注册事件处理器
   * Register event handler
   */
  on(event: string, handler: PreloadEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * 移除事件处理器
   * Remove event handler
   */
  off(event: string, handler: PreloadEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -ONE) {
        handlers.splice(index, ONE);
      }
    }
  }

  /**
   * 设置事件处理器
   * Setup event handlers
   */
  private setupEventHandlers(_preloader: IPreloader): void {
    // 这里可以设置默认的事件处理逻辑
    // 实际实现需要根据具体的事件系统来完成
  }
}
