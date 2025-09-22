// 调试Schema验证问题
import { contactFormSchema } from './src/lib/validations.js';

const testData = {
  firstName: 'J', // 应该被拒绝，因为只有1个字符
  lastName: 'Doe',
  email: 'john.doe@example.com',
  company: 'Test Company',
  message: 'This is a test message with sufficient length.',
  acceptPrivacy: true,
  website: ''
};

console.log('Testing Schema validation...');
console.log('Test data:', testData);

const result = contactFormSchema.safeParse(testData);
console.log('Validation result:', result.success);

if (!result.success) {
  console.log('Validation errors:', result.error.issues);
} else {
  console.log('Data passed validation (this is the problem!)');
  console.log('Validated data:', result.data);
}

// 测试常量值
import { COUNT_PAIR, PERCENTAGE_HALF } from './src/constants/index.js';
console.log('\nConstants check:');
console.log('COUNT_PAIR:', COUNT_PAIR);
console.log('PERCENTAGE_HALF:', PERCENTAGE_HALF);
