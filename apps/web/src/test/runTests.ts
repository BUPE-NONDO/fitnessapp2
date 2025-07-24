#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script provides utilities for running tests with different configurations
 * and generating reports.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

interface TestConfig {
  coverage?: boolean;
  watch?: boolean;
  ui?: boolean;
  filter?: string;
  reporter?: 'default' | 'verbose' | 'json' | 'html';
}

class TestRunner {
  private rootDir: string;
  private coverageDir: string;

  constructor() {
    this.rootDir = process.cwd();
    this.coverageDir = path.join(this.rootDir, 'coverage');
  }

  /**
   * Run tests with specified configuration
   */
  async runTests(config: TestConfig = {}) {
    const args = ['vitest'];

    if (config.coverage) {
      args.push('--coverage');
      this.ensureCoverageDir();
    }

    if (config.watch) {
      args.push('--watch');
    }

    if (config.ui) {
      args.push('--ui');
    }

    if (config.filter) {
      args.push('--grep', config.filter);
    }

    if (config.reporter) {
      args.push('--reporter', config.reporter);
    }

    try {
      console.log(`Running: npx ${args.join(' ')}`);
      execSync(`npx ${args.join(' ')}`, {
        stdio: 'inherit',
        cwd: this.rootDir,
      });
    } catch (error) {
      console.error('Test execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run specific test suites
   */
  async runSuite(suiteName: string) {
    const suiteMap = {
      schemas: 'src/test/schemas.test.ts',
      components: 'src/test/components/**/*.test.tsx',
      services: 'src/test/services/**/*.test.ts',
      utils: 'src/test/utils/**/*.test.ts',
      integration: 'src/test/integration/**/*.test.tsx',
    };

    const pattern = suiteMap[suiteName as keyof typeof suiteMap];
    if (!pattern) {
      console.error(`Unknown test suite: ${suiteName}`);
      console.log('Available suites:', Object.keys(suiteMap).join(', '));
      process.exit(1);
    }

    await this.runTests({ filter: pattern });
  }

  /**
   * Generate coverage report
   */
  async generateCoverage() {
    console.log('Generating coverage report...');
    await this.runTests({ 
      coverage: true,
      reporter: 'html',
    });

    console.log(`Coverage report generated at: ${this.coverageDir}/index.html`);
  }

  /**
   * Run tests in CI mode
   */
  async runCI() {
    console.log('Running tests in CI mode...');
    await this.runTests({
      coverage: true,
      reporter: 'json',
    });
  }

  /**
   * Start test UI for development
   */
  async startUI() {
    console.log('Starting Vitest UI...');
    await this.runTests({
      ui: true,
      coverage: true,
    });
  }

  /**
   * Ensure coverage directory exists
   */
  private ensureCoverageDir() {
    if (!existsSync(this.coverageDir)) {
      mkdirSync(this.coverageDir, { recursive: true });
    }
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log(`
Test Runner Commands:

  npm run test                    # Run all tests
  npm run test:watch             # Run tests in watch mode
  npm run test:ui                # Start Vitest UI
  npm run test:coverage          # Run tests with coverage
  npm run test:ci                # Run tests in CI mode

Test Suites:
  npm run test:schemas           # Run schema validation tests
  npm run test:components        # Run component tests
  npm run test:services          # Run service tests
  npm run test:utils             # Run utility tests
  npm run test:integration       # Run integration tests

Coverage:
  npm run test:coverage          # Generate HTML coverage report
  
Development:
  npm run test:ui                # Interactive test UI
  npm run test:watch             # Watch mode for development

Examples:
  npm run test -- --grep "GoalCard"     # Run specific test
  npm run test -- --coverage            # Run with coverage
  npm run test -- --ui                  # Start UI mode
    `);
  }
}

// CLI interface
if (require.main === module) {
  const runner = new TestRunner();
  const command = process.argv[2];

  switch (command) {
    case 'coverage':
      runner.generateCoverage();
      break;
    case 'ci':
      runner.runCI();
      break;
    case 'ui':
      runner.startUI();
      break;
    case 'watch':
      runner.runTests({ watch: true });
      break;
    case 'suite':
      const suiteName = process.argv[3];
      if (!suiteName) {
        console.error('Please specify a suite name');
        runner.showHelp();
        process.exit(1);
      }
      runner.runSuite(suiteName);
      break;
    case 'help':
    case '--help':
    case '-h':
      runner.showHelp();
      break;
    default:
      runner.runTests();
      break;
  }
}

export { TestRunner };
