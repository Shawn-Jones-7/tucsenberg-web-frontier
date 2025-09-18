---
type: 'always_apply'
---

# Augment Rules Configuration for tucsenberg-web-stable

## Overview

This directory contains 10 optimized Augment AI rules that guide development practices for the
tucsenberg-web-stable project. These rules ensure consistent, high-quality code that follows
enterprise standards. Rules have been optimized to stay within Augment's 49,512 character limit.

## Rule Files Structure

### 🔧 `coding-standards.md` (Always)

**Type**: Always  
**Purpose**: Core TypeScript/React development standards  
**Key Areas**: TypeScript strict mode, React patterns, import standards

### 🏗️ `project-architecture.md` (Auto)

**Type**: Auto  
**Description**: Architecture decisions and project structure guidelines  
**Key Areas**: File structure, component architecture, i18n, state management

### 🔄 `git-workflow.md` (Auto)

**Type**: Auto  
**Description**: Git workflow, commit standards, and quality gates  
**Key Areas**: Conventional commits, pre-commit hooks, quality checks

### ⚡ `performance-optimization.md` (Auto)

**Type**: Auto  
**Description**: Performance optimization strategies and Core Web Vitals  
**Key Areas**: Next.js optimization, image handling, caching, monitoring

### 🔬 `technical-implementation-methodology.md` (Auto)

**Type**: Auto  
**Description**: Research-first methodology for technical decisions  
**Key Areas**: Documentation research, quality assessment, decision frameworks

### 📘 `typescript-best-practices.md` (Auto)

**Type**: Auto  
**Description**: Comprehensive TypeScript best practices and advanced patterns  
**Key Areas**: Strict type safety, React component types, Framer Motion patterns

### 🎨 UI & Data Patterns (Integrated into coding-standards.md)

**Description**: UI component patterns with Radix UI, shadcn/ui, next-themes, and Zod validation
**Key Areas**: shadcn/ui patterns, Radix components, theme system, Zod validation, React 19 forms

### 🧪 `testing-compact.md` (Auto)

**Type**: Auto  
**Description**: Testing strategy and best practices with Jest and Testing Library  
**Key Areas**: Jest configuration, component testing, accessibility testing

### ♿ `accessibility-compact.md` (Auto)

**Type**: Auto  
**Description**: Accessibility testing and WCAG 2.1 AA compliance  
**Key Areas**: WCAG compliance, jest-axe testing, semantic HTML, ARIA patterns

### 🔒 `quality-compact.md` (Auto)

**Type**: Auto  
**Description**: Quality gates, CI/CD processes, and performance budgets  
**Key Areas**: Quality metrics, CI/CD pipeline, performance budgets

## Usage Guidelines

### For Developers

1. **Always Rules** are automatically included in every AI interaction
2. **Auto Rules** are intelligently selected based on your query context
3. **Manual Rules** can be explicitly referenced using @filename

### For AI Assistant

- Follow coding-standards.md for all code generation
- Reference appropriate auto rules based on task context
- Ensure compliance with project architecture patterns
- Maintain performance and accessibility standards

## Rule Optimization Notes

- **Character Limit**: Total workspace rules limited to 49,512 characters
- **Compression Strategy**: Combined related rules, removed redundant examples
- **Maintained Coverage**: All essential development areas still covered
- **Quality Preserved**: Core guidance and best practices retained

## Integration with Development Workflow

- Rules complement existing ESLint/Prettier configuration and align with husky pre-commit hooks
- Support CI/CD pipeline requirements with quality gates and enhance code review process
- Integrate with Jest testing framework, accessibility testing, and Lighthouse CI performance monitoring
- Enable next-themes and Zod validation patterns
