import type {
  AirtableBaseLike,
  AirtableServicePrivate,
} from '@/types/test-types';

export const createMockBase = <Fields = Record<string, unknown>>(
  tableFactory: AirtableBaseLike<Fields>['table'],
): AirtableBaseLike<Fields> => ({
  table: tableFactory,
});

export const configureServiceForTesting = <Fields = Record<string, unknown>>(
  service: unknown,
  base: AirtableBaseLike<Fields>,
): void => {
  const target = service as AirtableServicePrivate<Fields>;
  target.isConfigured = true;
  target.base = base;
};
