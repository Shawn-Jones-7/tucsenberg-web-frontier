#!/usr/bin/env node

/**
 * GitHub Actions工作流分析工具
 * GitHub Actions workflow analysis tool
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const workflowsDir = '.github/workflows';

// 获取所有工作流文件
function getWorkflowFiles() {
  if (!fs.existsSync(workflowsDir)) {
    return [];
  }

  return fs
    .readdirSync(workflowsDir)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map((file) => path.join(workflowsDir, file));
}

// 分析工作流内容
function analyzeWorkflow(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = yaml.load(content);

    return {
      file: path.basename(filePath),
      name: workflow.name || 'Unnamed',
      triggers: workflow.on || {},
      jobs: Object.keys(workflow.jobs || {}),
      jobCount: Object.keys(workflow.jobs || {}).length,
      steps: extractSteps(workflow.jobs || {}),
      dependencies: extractDependencies(workflow.jobs || {}),
      runners: extractRunners(workflow.jobs || {}),
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

// 提取步骤信息
function extractSteps(jobs) {
  const allSteps = [];
  Object.values(jobs).forEach((job) => {
    if (job.steps) {
      job.steps.forEach((step) => {
        if (step.name) {
          allSteps.push(step.name);
        } else if (step.run) {
          allSteps.push(`${step.run.split('\n')[0].substring(0, 50)}...`);
        } else if (step.uses) {
          allSteps.push(`uses: ${step.uses}`);
        }
      });
    }
  });
  return allSteps;
}

// 提取依赖关系
function extractDependencies(jobs) {
  const deps = [];
  Object.entries(jobs).forEach(([jobName, job]) => {
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      needs.forEach((dep) => {
        deps.push(`${jobName} needs ${dep}`);
      });
    }
  });
  return deps;
}

// 提取运行器信息
function extractRunners(jobs) {
  const runners = new Set();
  Object.values(jobs).forEach((job) => {
    if (job['runs-on']) {
      runners.add(job['runs-on']);
    }
  });
  return Array.from(runners);
}

// 检测重复功能
function detectDuplicates(workflows) {
  const duplicates = [];
  const stepGroups = {};

  workflows.forEach((workflow) => {
    workflow.steps.forEach((step) => {
      if (!stepGroups[step]) {
        stepGroups[step] = [];
      }
      stepGroups[step].push(workflow.file);
    });
  });

  Object.entries(stepGroups).forEach(([step, files]) => {
    if (files.length > 1) {
      duplicates.push({
        step,
        files: [...new Set(files)], // 去重
        count: files.length,
      });
    }
  });

  return duplicates.filter((dup) => dup.files.length > 1);
}

// 主分析函数
function main() {
  console.log('🔍 GitHub Actions工作流分析');
  console.log('='.repeat(50));

  const workflowFiles = getWorkflowFiles();

  if (workflowFiles.length === 0) {
    console.log('❌ 未找到工作流文件');
    return;
  }

  console.log(`📁 发现 ${workflowFiles.length} 个工作流文件:`);
  workflowFiles.forEach((file) => console.log(`  - ${file}`));

  const workflows = workflowFiles.map(analyzeWorkflow).filter(Boolean);

  console.log('\n📊 工作流概览:');
  workflows.forEach((workflow) => {
    console.log(`\n📄 ${workflow.file}`);
    console.log(`  名称: ${workflow.name}`);
    console.log(`  作业数: ${workflow.jobCount}`);
    console.log(`  运行器: ${workflow.runners.join(', ')}`);
    console.log(`  触发器: ${Object.keys(workflow.triggers).join(', ')}`);

    if (workflow.dependencies.length > 0) {
      console.log(`  依赖: ${workflow.dependencies.join(', ')}`);
    }
  });

  // 检测重复
  const duplicates = detectDuplicates(workflows);

  if (duplicates.length > 0) {
    console.log('\n⚠️  发现重复功能:');
    duplicates.forEach((dup) => {
      if (dup.files.length > 1) {
        console.log(`  "${dup.step}" 出现在: ${dup.files.join(', ')}`);
      }
    });
  }

  // 优化建议
  console.log('\n💡 优化建议:');

  // 检查是否有太多工作流
  if (workflows.length > 5) {
    console.log('  - 工作流数量较多，考虑合并相似功能');
  }

  // 检查是否有重复的质量检查
  const qualityWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes('quality') ||
      w.name.toLowerCase().includes('test'),
  );

  if (qualityWorkflows.length > 2) {
    console.log(
      `  - 发现 ${qualityWorkflows.length} 个质量检查工作流，建议合并`,
    );
  }

  // 检查是否有重复的E2E测试
  const e2eWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes('e2e'),
  );

  if (e2eWorkflows.length > 1) {
    console.log(`  - 发现 ${e2eWorkflows.length} 个E2E测试工作流，建议合并`);
  }

  console.log('\n🎯 推荐保留的核心工作流:');
  console.log('  1. 主要CI/CD流水线（构建、测试、部署）');
  console.log('  2. 质量检查（代码质量、安全、性能）');
  console.log('  3. 依赖更新（可选）');
}

// 检查是否安装了js-yaml
try {
  require('js-yaml');
} catch (error) {
  console.error('❌ 需要安装 js-yaml: npm install js-yaml');
  process.exit(1);
}

main();
