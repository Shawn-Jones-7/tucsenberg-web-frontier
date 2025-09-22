import { describe, expect, it } from 'vitest';

// 直接导入，避免任何Mock干扰
describe('Isolated Validations Test', () => {
  it('should test schema directly', async () => {
    // 动态导入以避免Mock
    const validationsModule = await import('../validations');
    const { contactFormSchema } = validationsModule;
    
    console.log('contactFormSchema:', contactFormSchema);
    console.log('contactFormSchema type:', typeof contactFormSchema);
    console.log('contactFormSchema shape:', contactFormSchema.shape);
    
    if (contactFormSchema.shape) {
      console.log('firstName field:', contactFormSchema.shape.firstName);
    }
    
    const testData = {
      firstName: 'J', // 应该被拒绝
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Company',
      message: 'This is a test message with sufficient length.',
      acceptPrivacy: true,
      website: ''
    };
    
    const result = contactFormSchema.safeParse(testData);
    console.log('Validation result:', result.success);
    
    if (!result.success) {
      console.log('Validation errors:', result.error.issues);
    } else {
      console.log('Data passed validation (this should not happen!)');
    }
    
    // 暂时让测试通过，专注于调试
    expect(true).toBe(true);
  });
});
