/**
 * Airtable 核心服务类
 */

import Airtable from 'airtable';
import { env } from '@/../env.mjs';
import { logger } from '@/lib/logger';
import { airtableRecordSchema, validationHelpers } from '@/lib/validations';
import type {
  AirtableQueryOptions,
  AirtableRecord,
  ContactFormData,
  ContactStatus,
} from './types';

/**
 * Airtable配置和初始化
 * Airtable configuration and initialization
 */
export class AirtableService {
  private base: Airtable.Base | null = null;
  private tableName: string;
  private isConfigured: boolean = false;

  constructor() {
    this.tableName = env.AIRTABLE_TABLE_NAME || 'Contacts';
    this.initializeAirtable();
  }

  /**
   * 初始化Airtable连接
   * Initialize Airtable connection
   */
  private initializeAirtable(): void {
    try {
      if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
        logger.warn(
          'Airtable configuration missing - service will be disabled',
          {
            hasApiKey: Boolean(env.AIRTABLE_API_KEY),
            hasBaseId: Boolean(env.AIRTABLE_BASE_ID),
          },
        );
        return;
      }

      Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: env.AIRTABLE_API_KEY,
      });

      this.base = Airtable.base(env.AIRTABLE_BASE_ID);
      this.isConfigured = true;

      logger.info('Airtable service initialized successfully', {
        tableName: this.tableName,
      });
    } catch (error) {
      logger.error('Failed to initialize Airtable service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 检查服务是否已配置
   * Check if service is configured
   */
  public isReady(): boolean {
    return this.isConfigured && this.base !== null;
  }

  /**
   * 清理表单数据
   * Sanitize form data before saving
   */
  private sanitizeFormData(formData: ContactFormData): ContactFormData {
    return {
      firstName: validationHelpers.sanitizeInput(formData.firstName),
      lastName: validationHelpers.sanitizeInput(formData.lastName),
      email: formData.email.toLowerCase().trim(),
      company: validationHelpers.sanitizeInput(formData.company),
      message: validationHelpers.sanitizeInput(formData.message),
      phone: formData.phone
        ? validationHelpers.sanitizeInput(formData.phone)
        : undefined,
      subject: formData.subject
        ? validationHelpers.sanitizeInput(formData.subject)
        : undefined,
      acceptPrivacy: formData.acceptPrivacy,
      marketingConsent: formData.marketingConsent,
      website: formData.website,
    };
  }

  /**
   * 创建联系人记录
   * Create contact record in Airtable
   */
  public async createContact(
    formData: ContactFormData,
  ): Promise<AirtableRecord> {
    if (!this.isReady()) {
      throw new Error('Airtable service is not configured');
    }

    try {
      // 清理和验证数据
      const sanitizedData = this.sanitizeFormData(formData);

      // 构建Airtable记录
      const recordData = {
        'First Name': sanitizedData.firstName,
        'Last Name': sanitizedData.lastName,
        'Email': sanitizedData.email,
        'Company': sanitizedData.company,
        'Message': sanitizedData.message,
        'Phone': sanitizedData.phone || '',
        'Subject': sanitizedData.subject || '',
        'Submitted At': new Date().toISOString(),
        'Status': 'New' as const,
        'Source': 'Website Contact Form',
        'Marketing Consent': sanitizedData.marketingConsent || false,
      };

      // 验证记录格式
      const validatedRecord = airtableRecordSchema.parse({
        fields: recordData,
      });

      // 创建记录
      const records = await this.base!.table(this.tableName).create([
        {
          fields: validatedRecord.fields,
        },
      ]);

      const [createdRecord] = records;

      if (!createdRecord) {
        throw new Error('Failed to create record');
      }

      logger.info('Contact record created successfully', {
        recordId: createdRecord.id,
        email: sanitizedData.email,
        company: sanitizedData.company,
      });

      return {
        id: createdRecord.id,
        fields: createdRecord.fields as AirtableRecord['fields'],
        createdTime: createdRecord.get('Created Time') as string,
      };
    } catch (error) {
      logger.error('Failed to create contact record', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: formData.email,
      });
      throw new Error('Failed to save contact information');
    }
  }

  /**
   * 获取联系人记录
   * Get contact records from Airtable
   */
  public async getContacts(
    options: AirtableQueryOptions = {},
  ): Promise<AirtableRecord[]> {
    if (!this.isReady()) {
      throw new Error('Airtable service is not configured');
    }

    try {
      const { maxRecords = 100, filterByFormula, sort } = options;

      const selectOptions: {
        maxRecords: number;
        filterByFormula?: string;
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      } = { maxRecords };
      if (filterByFormula) {
        selectOptions.filterByFormula = filterByFormula;
      }
      if (sort) {
        selectOptions.sort = sort;
      }

      const records = await this.base!.table(this.tableName)
        .select(selectOptions)
        .all();

      return records.map((record) => ({
        id: record.id,
        fields: record.fields as AirtableRecord['fields'],
        createdTime: record.get('Created Time') as string,
      }));
    } catch (error) {
      logger.error('Failed to fetch contact records', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to fetch contact records');
    }
  }

  /**
   * 更新联系人记录状态
   * Update contact record status
   */
  public async updateContactStatus(
    recordId: string,
    status: ContactStatus,
  ): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Airtable service is not configured');
    }

    try {
      await this.base!.table(this.tableName).update([
        {
          id: recordId,
          fields: {
            'Status': status,
            'Updated At': new Date().toISOString(),
          },
        },
      ]);

      logger.info('Contact record status updated', {
        recordId,
        newStatus: status,
      });
    } catch (error) {
      logger.error('Failed to update contact record status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId,
        status,
      });
      throw new Error('Failed to update contact status');
    }
  }

  /**
   * 删除联系人记录
   * Delete contact record
   */
  public async deleteContact(recordId: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Airtable service is not configured');
    }

    try {
      await this.base!.table(this.tableName).destroy([recordId]);

      logger.info('Contact record deleted', {
        recordId,
      });
    } catch (error) {
      logger.error('Failed to delete contact record', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId,
      });
      throw new Error('Failed to delete contact record');
    }
  }

  /**
   * 检查重复邮箱
   * Check for duplicate email addresses
   */
  public async isDuplicateEmail(email: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const records = await this.base!.table(this.tableName)
        .select({
          filterByFormula: `{Email} = "${email.toLowerCase()}"`,
          maxRecords: 1,
        })
        .all();

      return records.length > 0;
    } catch (error) {
      logger.error('Failed to check duplicate email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      return false;
    }
  }

  /**
   * 获取统计信息
   * Get statistics
   */
  public async getStatistics(): Promise<{
    totalContacts: number;
    newContacts: number;
    completedContacts: number;
    recentContacts: number;
  }> {
    if (!this.isReady()) {
      throw new Error('Airtable service is not configured');
    }

    try {
      const [total, newContacts, completed, recent] = await Promise.all([
        this.getContacts({ maxRecords: 1000 }),
        this.getContacts({
          filterByFormula: `{Status} = "New"`,
          maxRecords: 1000,
        }),
        this.getContacts({
          filterByFormula: `{Status} = "Completed"`,
          maxRecords: 1000,
        }),
        this.getContacts({
          filterByFormula: `IS_AFTER({Submitted At}, DATEADD(TODAY(), -7, 'days'))`,
          maxRecords: 1000,
        }),
      ]);

      return {
        totalContacts: total.length,
        newContacts: newContacts.length,
        completedContacts: completed.length,
        recentContacts: recent.length,
      };
    } catch (error) {
      logger.error('Failed to get statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to get statistics');
    }
  }
}
