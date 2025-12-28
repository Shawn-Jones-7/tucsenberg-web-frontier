import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock child_process and fs to avoid real git/file operations
vi.mock('child_process', () => ({
  execSync: vi.fn(() => ''),
  spawnSync: vi.fn(() => ({ status: 0, stdout: '', stderr: '' })),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => '{}'),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('glob', () => ({
  sync: vi.fn(() => []),
}));

// Import after mocks
const { QualityGate } = await import('../../../scripts/quality-gate.js');

describe('QualityGate Diff Coverage', () => {
  let gate: InstanceType<typeof QualityGate>;

  beforeEach(() => {
    vi.clearAllMocks();
    gate = new QualityGate();
  });

  describe('getChangedStatementCoverage', () => {
    it('returns zero for null entry', () => {
      const result = gate.getChangedStatementCoverage(null, new Set([1, 2, 3]));
      expect(result).toEqual({ total: 0, covered: 0 });
    });

    it('returns zero for entry without statementMap', () => {
      const entry = { s: { '0': 1 } };
      const result = gate.getChangedStatementCoverage(
        entry,
        new Set([1, 2, 3]),
      );
      expect(result).toEqual({ total: 0, covered: 0 });
    });

    it('returns zero for entry without statement hits', () => {
      const entry = {
        statementMap: { '0': { start: { line: 1 }, end: { line: 1 } } },
      };
      const result = gate.getChangedStatementCoverage(
        entry,
        new Set([1, 2, 3]),
      );
      expect(result).toEqual({ total: 0, covered: 0 });
    });

    it('counts statement when change intersects with statement range (startLine)', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 10 }, end: { line: 12 } },
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([10]));
      expect(result).toEqual({ total: 1, covered: 1 });
    });

    it('counts statement when change intersects with statement range (middleLine)', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 10 }, end: { line: 12 } },
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([11]));
      expect(result).toEqual({ total: 1, covered: 1 });
    });

    it('counts statement when change intersects with statement range (endLine)', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 10 }, end: { line: 12 } },
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([12]));
      expect(result).toEqual({ total: 1, covered: 1 });
    });

    it('does not count statement when change is outside range', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 10 }, end: { line: 12 } },
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([5, 15]));
      expect(result).toEqual({ total: 0, covered: 0 });
    });

    it('marks uncovered statement (hits=0) as not covered', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 10 }, end: { line: 12 } },
        },
        s: { '0': 0 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([11]));
      expect(result).toEqual({ total: 1, covered: 0 });
    });

    it('handles multiple statements correctly', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 1 }, end: { line: 3 } },
          '1': { start: { line: 5 }, end: { line: 7 } },
          '2': { start: { line: 10 }, end: { line: 10 } },
        },
        s: { '0': 1, '1': 0, '2': 1 },
      };
      const result = gate.getChangedStatementCoverage(
        entry,
        new Set([2, 6, 10]),
      );
      expect(result).toEqual({ total: 3, covered: 2 });
    });

    it('handles reversed start/end lines', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 12 }, end: { line: 10 } },
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([11]));
      expect(result).toEqual({ total: 1, covered: 1 });
    });
  });

  describe('calculateDiffCoverage with synthetic data', () => {
    it('skips type-only file (empty statementMap) without counting in denominator', () => {
      const changedLinesByFile = new Map([
        ['src/types/foo.ts', new Set([1, 2, 3])],
      ]);

      const istanbulCoverageMap = {
        'src/types/foo.ts': {
          statementMap: {},
          s: {},
        },
      };

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).toBeNull();
      expect(gate.getChangedLinesByFile).toHaveBeenCalled();
    });

    it('marks file with empty statementMap as skippedNonExecutable', () => {
      const changedLinesByFile = new Map([
        ['src/types/foo.ts', new Set([1, 2])],
        ['src/lib/bar.ts', new Set([10])],
      ]);

      const istanbulCoverageMap = {
        'src/types/foo.ts': {
          statementMap: {},
          s: {},
        },
        'src/lib/bar.ts': {
          statementMap: {
            '0': { start: { line: 10 }, end: { line: 10 } },
          },
          s: { '0': 1 },
        },
      };

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).not.toBeNull();
      expect(result?.metric).toBe('statements');
      expect(result?.unitLabel).toBe('可执行语句');
      expect(result?.totalStatements).toBe(1);
      expect(result?.totalCovered).toBe(1);
      expect(result?.pct).toBe(100);

      const typeFile = result?.fileMetrics.find(
        (f) => f.file === 'src/types/foo.ts',
      );
      expect(typeFile?.skippedNonExecutable).toBe(true);
    });

    it('marks missing entry as missingCoverageData (Strategy A)', () => {
      const changedLinesByFile = new Map([
        ['src/lib/new-file.ts', new Set([1, 2, 3])],
      ]);

      const istanbulCoverageMap = {};

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).not.toBeNull();
      expect(result?.missingCoverageData).toBe(true);
      expect(result?.missingCoverageFiles).toContain('src/lib/new-file.ts');
      expect(result?.pct).toBe(0);

      const missingFile = result?.fileMetrics.find(
        (f) => f.file === 'src/lib/new-file.ts',
      );
      expect(missingFile?.missingCoverageData).toBe(true);
    });

    it('uses statement range intersection for multi-line statements', () => {
      const changedLinesByFile = new Map([
        ['src/lib/multi-line.ts', new Set([11])],
      ]);

      const istanbulCoverageMap = {
        'src/lib/multi-line.ts': {
          statementMap: {
            '0': { start: { line: 10 }, end: { line: 12 } },
          },
          s: { '0': 1 },
        },
      };

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).not.toBeNull();
      expect(result?.totalStatements).toBe(1);
      expect(result?.totalCovered).toBe(1);
      expect(result?.pct).toBe(100);
    });

    it('calculates correct percentage for mixed covered/uncovered', () => {
      const changedLinesByFile = new Map([
        ['src/lib/mixed.ts', new Set([1, 5, 10])],
      ]);

      const istanbulCoverageMap = {
        'src/lib/mixed.ts': {
          statementMap: {
            '0': { start: { line: 1 }, end: { line: 1 } },
            '1': { start: { line: 5 }, end: { line: 5 } },
            '2': { start: { line: 10 }, end: { line: 10 } },
          },
          s: { '0': 1, '1': 0, '2': 1 },
        },
      };

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).not.toBeNull();
      expect(result?.totalStatements).toBe(3);
      expect(result?.totalCovered).toBe(2);
      expect(result?.pct).toBeCloseTo(66.67, 1);
    });

    it('marks entry with statementMap but missing entry.s as missingCoverageData (P1 fix)', () => {
      const changedLinesByFile = new Map([
        ['src/lib/corrupted.ts', new Set([1, 2])],
      ]);

      const istanbulCoverageMap = {
        'src/lib/corrupted.ts': {
          statementMap: {
            '0': { start: { line: 1 }, end: { line: 2 } },
          },
          // Missing `s` property - corrupted coverage data
        },
      };

      const coverageSummaryData = {
        total: { statements: { pct: 80 } },
      };

      vi.spyOn(gate, 'getChangedLinesByFile').mockReturnValue(
        changedLinesByFile,
      );
      vi.spyOn(gate, 'shouldExcludeFromDiffCoverage').mockReturnValue(false);

      const result = gate.calculateDiffCoverage(
        coverageSummaryData,
        istanbulCoverageMap,
      );

      expect(result).not.toBeNull();
      expect(result?.missingCoverageData).toBe(true);
      expect(result?.missingCoverageFiles).toContain('src/lib/corrupted.ts');

      const corruptedFile = result?.fileMetrics.find(
        (f) => f.file === 'src/lib/corrupted.ts',
      );
      expect(corruptedFile?.missingCoverageData).toBe(true);
      expect(corruptedFile?.skippedNonExecutable).toBeUndefined();
    });
  });

  describe('getChangedStatementCoverage edge cases', () => {
    it('handles statement with missing end.line as single-line (P2 fix)', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 5 } }, // Missing end.line
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([5]));
      expect(result).toEqual({ total: 1, covered: 1 });
    });

    it('skips statement with missing start.line', () => {
      const entry = {
        statementMap: {
          '0': { end: { line: 5 } }, // Missing start.line
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([5]));
      expect(result).toEqual({ total: 0, covered: 0 });
    });

    it('does not count statement with missing end.line when change is outside start line', () => {
      const entry = {
        statementMap: {
          '0': { start: { line: 5 } }, // Missing end.line, treated as line 5 only
        },
        s: { '0': 1 },
      };
      const result = gate.getChangedStatementCoverage(entry, new Set([6]));
      expect(result).toEqual({ total: 0, covered: 0 });
    });
  });
});
