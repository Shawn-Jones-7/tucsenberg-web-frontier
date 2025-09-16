/**
 * WhatsApp Service Interface and Utility Types
 *
 * This module provides the main service interface definition,
 * utility types, and common type aliases for the WhatsApp service.
 */

import type {
  LogLevel,
  MessageStatus,
  MessageType,
  ServiceEnvironment,
  WhatsAppConfig,
  WhatsAppServiceOptions,
} from './whatsapp-service-config';
import type { WhatsAppError } from '@/types/whatsapp-service-errors';
import type {
  ServiceHealth,
  ServiceMetrics,
  ServiceStatus,
  WhatsAppServiceEvent,
} from './whatsapp-service-monitoring';

// ==================== Main Service Interface ====================

/**
 * WhatsApp Service Interface
 * Main interface that all WhatsApp service implementations must follow
 */
export interface WhatsAppServiceInterface {
  // ==================== Configuration Methods ====================

  /**
   * Initialize the service with configuration and options
   * @param config - WhatsApp API configuration
   * @param options - Optional service configuration
   */
  initialize: (
    config: WhatsAppConfig,
    options?: WhatsAppServiceOptions,
  ) => Promise<void>;

  /**
   * Get current service status
   * @returns Current service status including health and metrics
   */
  getStatus: () => ServiceStatus;

  /**
   * Perform health check and get health status
   * @returns Promise resolving to current health status
   */
  getHealth: () => Promise<ServiceHealth>;

  /**
   * Get service metrics
   * @returns Current service metrics
   */
  getMetrics: () => ServiceMetrics;

  /**
   * Reset service metrics
   */
  resetMetrics: () => void;

  // ==================== Messaging Methods ====================

  /**
   * Send a single message
   * @param request - Message request object
   * @returns Promise resolving to message response
   */
  sendMessage: (request: unknown) => Promise<unknown>;

  /**
   * Send multiple messages in bulk
   * @param requests - Array of message request objects
   * @returns Promise resolving to array of message responses
   */
  sendBulkMessages: (requests: unknown[]) => Promise<unknown[]>;

  /**
   * Send a text message
   * @param to - Recipient phone number
   * @param text - Message text
   * @returns Promise resolving to message response
   */
  sendTextMessage: (to: string, text: string) => Promise<unknown>;

  /**
   * Send a template message
   * @param to - Recipient phone number
   * @param templateName - Template name
   * @param templateData - Template parameters
   * @returns Promise resolving to message response
   */
  sendTemplateMessage: (
    to: string,
    templateName: string,
    templateData?: Record<string, unknown>,
  ) => Promise<unknown>;

  // ==================== Media Methods ====================

  /**
   * Upload media file
   * @param file - File to upload (File object or Buffer)
   * @param type - Media type
   * @returns Promise resolving to media upload response with ID
   */
  uploadMedia: (file: File | Buffer, type: string) => Promise<{ id: string }>;

  /**
   * Get media URL from media ID
   * @param mediaId - Media ID from upload
   * @returns Promise resolving to media URL
   */
  getMediaUrl: (mediaId: string) => Promise<{ url: string }>;

  /**
   * Download media from URL
   * @param url - Media URL
   * @returns Promise resolving to media buffer
   */
  downloadMedia: (url: string) => Promise<Buffer>;

  // ==================== Utility Methods ====================

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns True if phone number is valid
   */
  validatePhoneNumber: (phoneNumber: string) => boolean;

  /**
   * Format phone number to WhatsApp format
   * @param phoneNumber - Phone number to format
   * @returns Formatted phone number
   */
  formatPhoneNumber: (phoneNumber: string) => string;

  /**
   * Validate message content
   * @param message - Message object to validate
   * @returns True if message is valid
   */
  validateMessage: (message: unknown) => boolean;

  // ==================== Event Methods ====================

  /**
   * Add event listener
   * @param event - Event name
   * @param listener - Event listener function
   */
  on: (event: string, listener: (data: unknown) => void) => void;

  /**
   * Remove event listener
   * @param event - Event name
   * @param listener - Event listener function to remove
   */
  off: (event: string, listener: (data: unknown) => void) => void;

  /**
   * Emit event
   * @param event - Event name
   * @param data - Event data
   */
  emit: (event: string, data: unknown) => void;

  /**
   * Remove all event listeners
   */
  removeAllListeners: () => void;

  // ==================== Lifecycle Methods ====================

  /**
   * Start the service
   * @returns Promise that resolves when service is started
   */
  start: () => Promise<void>;

  /**
   * Stop the service
   * @returns Promise that resolves when service is stopped
   */
  stop: () => Promise<void>;

  /**
   * Restart the service
   * @returns Promise that resolves when service is restarted
   */
  restart: () => Promise<void>;

  /**
   * Check if service is running
   * @returns True if service is running
   */
  isRunning: () => boolean;
}

// ==================== Request/Response Types ====================

/**
 * Generic API Request
 * Base structure for API requests
 */
export interface ApiRequest {
  /** Request method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request endpoint */
  endpoint: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Generic API Response
 * Base structure for API responses
 */
export interface ApiResponse<T = unknown> {
  /** Response status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response data */
  data: T;
  /** Response timestamp */
  timestamp: number;
  /** Request duration in milliseconds */
  duration: number;
}

/**
 * Message Request
 * Base structure for message requests
 */
export interface MessageRequest {
  /** Recipient phone number */
  to: string;
  /** Message type */
  type: MessageType;
  /** Message content */
  content: unknown;
  /** Optional message metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Message Response
 * Base structure for message responses
 */
export interface MessageResponse {
  /** WhatsApp message ID */
  messageId: string;
  /** Message status */
  status: MessageStatus;
  /** Response timestamp */
  timestamp: number;
  /** Additional response data */
  data?: unknown;
}

// ==================== Webhook Types ====================

/**
 * Webhook Handler
 * Function signature for webhook handlers
 */
export type WebhookHandler = (payload: unknown) => Promise<void> | void;

/**
 * Webhook Configuration
 * Configuration for webhook handling
 */
export interface WebhookConfig {
  /** Webhook URL */
  url: string;
  /** Verification token */
  verifyToken: string;
  /** Whether to validate webhook signatures */
  validateSignature: boolean;
  /** App secret for signature validation */
  appSecret?: string;
}

// ==================== Type Aliases ====================

/**
 * Shorter type aliases for commonly used types
 */
export type {
  WhatsAppConfig as Config,
  WhatsAppServiceOptions as ServiceOptions,
  ServiceStatus as Status,
  ServiceHealth as Health,
  ServiceMetrics as Metrics,
  WhatsAppServiceInterface as ServiceInterface,
  WhatsAppServiceEvent as ServiceEvent,
  WhatsAppError as ServiceError,
};

// ==================== Factory Types ====================

/**
 * Service Factory Function
 * Function signature for creating service instances
 */
export type ServiceFactory = (
  config: WhatsAppConfig,
  options?: WhatsAppServiceOptions,
) => WhatsAppServiceInterface;

/**
 * Service Builder
 * Builder pattern interface for service configuration
 */
export interface ServiceBuilder {
  /** Set configuration */
  withConfig: (config: WhatsAppConfig) => ServiceBuilder;
  /** Set options */
  withOptions: (options: WhatsAppServiceOptions) => ServiceBuilder;
  /** Set environment */
  withEnvironment: (env: ServiceEnvironment) => ServiceBuilder;
  /** Set log level */
  withLogLevel: (level: LogLevel) => ServiceBuilder;
  /** Enable/disable features */
  withFeature: (feature: string, enabled: boolean) => ServiceBuilder;
  /** Build service instance */
  build: () => WhatsAppServiceInterface;
}

// ==================== Plugin Types ====================

/**
 * Service Plugin
 * Interface for service plugins/extensions
 */
export interface ServicePlugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Initialize plugin */
  initialize: (service: WhatsAppServiceInterface) => Promise<void>;
  /** Cleanup plugin */
  cleanup: () => Promise<void>;
}

/**
 * Plugin Manager
 * Interface for managing service plugins
 */
export interface PluginManager {
  /** Register plugin */
  register: (plugin: ServicePlugin) => void;
  /** Unregister plugin */
  unregister: (pluginName: string) => void;
  /** Get registered plugins */
  getPlugins: () => ServicePlugin[];
  /** Initialize all plugins */
  initializeAll: (service: WhatsAppServiceInterface) => Promise<void>;
  /** Cleanup all plugins */
  cleanupAll: () => Promise<void>;
}

// ==================== Utility Functions ====================

/**
 * Check if object implements WhatsApp service interface
 */
export function isWhatsAppService(
  obj: unknown,
): obj is WhatsAppServiceInterface {
  if (!obj || typeof obj !== 'object') return false;

  const service = obj as Partial<WhatsAppServiceInterface>;

  return Boolean(typeof service.initialize === 'function' &&
    typeof service.getStatus === 'function' &&
    typeof service.getHealth === 'function' &&
    typeof service.sendMessage === 'function' &&
    typeof service.on === 'function' &&
    typeof service.off === 'function');
}

/**
 * Create default service status
 */
export function createDefaultServiceStatus(): ServiceStatus {
  return {
    isInitialized: false,
    isConnected: false,
    lastActivity: Date.now(),
    health: {
      status: 'healthy',
      lastCheck: Date.now(),
      responseTime: 0,
      errorRate: 0,
      uptime: 100,
      details: {
        api: 'available',
        webhook: 'not_configured',
        phoneNumber: 'unverified',
      },
    },
    metrics: {
      messagesSent: 0,
      messagesDelivered: 0,
      messagesRead: 0,
      messagesFailed: 0,
      apiCalls: 0,
      apiErrors: 0,
      averageResponseTime: 0,
      uptime: 100,
      lastReset: Date.now(),
    },
    config: {
      phoneNumberId: '',
      apiVersion: 'v18.0',
      webhookConfigured: false,
    },
  };
}
