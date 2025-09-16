/**
 * 预加载器管理器
 * Preloader Manager
 */

import type { IPreloader, PreloadState } from '@/lib/i18n-preloader-types';

/**
 * 预加载器管理器
 * Preloader manager
 */
export class PreloaderManager {
  private preloaders = new Map<string, IPreloader>();
  private defaultPreloader?: IPreloader | undefined;

  /**
   * 注册预加载器
   * Register preloader
   */
  register(name: string, preloader: IPreloader): void {
    this.preloaders.set(name, preloader);
    if (!this.defaultPreloader) {
      this.defaultPreloader = preloader;
    }
  }

  /**
   * 获取预加载器
   * Get preloader
   */
  get(name?: string): IPreloader | undefined {
    if (name) {
      return this.preloaders.get(name);
    }
    return this.defaultPreloader;
  }

  /**
   * 设置默认预加载器
   * Set default preloader
   */
  setDefault(name: string): boolean {
    const preloader = this.preloaders.get(name);
    if (preloader) {
      this.defaultPreloader = preloader;
      return true;
    }
    return false;
  }

  /**
   * 移除预加载器
   * Remove preloader
   */
  remove(name: string): boolean {
    const preloader = this.preloaders.get(name);
    if (preloader) {
      preloader.cleanup();
      this.preloaders.delete(name);
      if (this.defaultPreloader === preloader) {
        this.defaultPreloader =
          this.preloaders.values().next().value || undefined;
      }
      return true;
    }
    return false;
  }

  /**
   * 清理所有预加载器
   * Cleanup all preloaders
   */
  cleanup(): void {
    this.preloaders.forEach((preloader) => {
      preloader.cleanup();
    });
    this.preloaders.clear();
    this.defaultPreloader = undefined;
  }

  /**
   * 获取所有预加载器状态
   * Get all preloader states
   */
  getAllStates(): Record<string, PreloadState> {
    const states: Record<string, PreloadState> = {};
    this.preloaders.forEach((preloader, name) => {
      states[name] = preloader.getPreloadState();
    });
    return states;
  }

  /**
   * 停止所有预加载
   * Stop all preloading
   */
  stopAll(): void {
    this.preloaders.forEach((preloader) => {
      preloader.stopPreloading();
    });
  }
}
