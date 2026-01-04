#!/bin/bash

# =============================================================================
# 本地 CI 完整检查脚本
# 完全模拟远程 GitHub Actions CI/CD Pipeline (ci.yml)
# =============================================================================
# 使用方法：
#   pnpm ci:local           # 运行完整检查
#   pnpm ci:local:quick     # 快速检查（跳过耗时任务）
#   pnpm ci:local:fix       # 自动修复可修复的问题
# =============================================================================
# CI 架构说明：
#   - ci.yml: 主流水线，PR 必需检查（type-check, lint, test, security, etc.）
#   - code-quality.yml: 深度安全扫描（Semgrep full），仅 main + nightly
#   - vercel-deploy.yml: 部署专用（MISSING_MESSAGE 检测 + 健康检查）
# =============================================================================
# 质量门禁：所有阈值由 scripts/quality-gate.js 统一管理
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
SKIPPED_CHECKS=0

# 开始时间
START_TIME=$(date +%s)

# 打印带颜色的消息
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${YELLOW}[$TOTAL_CHECKS] $1${NC}"
}

print_success() {
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo -e "${RED}❌ $1${NC}"
}

print_skip() {
    SKIPPED_CHECKS=$((SKIPPED_CHECKS + 1))
    echo -e "${YELLOW}⏭️  $1${NC}"
}

# 检查 Node.js 版本
check_node_version() {
    print_step "检查 Node.js 版本"

    CURRENT_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    REQUIRED_VERSION=20

    if [ "$CURRENT_VERSION" -ge "$REQUIRED_VERSION" ]; then
        print_success "Node.js 版本正确: v$CURRENT_VERSION (要求 ≥ v$REQUIRED_VERSION)"
    else
        print_error "Node.js 版本过低: v$CURRENT_VERSION (需要 v$REQUIRED_VERSION+)"
        echo "  建议: nvm install 20 && nvm use 20"
        return 1
    fi
}

# 检查 pnpm 版本
check_pnpm_version() {
    print_step "检查 pnpm 版本"

    CURRENT_VERSION=$(pnpm --version)
    REQUIRED_VERSION="10.13.1"

    if [ "$CURRENT_VERSION" = "$REQUIRED_VERSION" ]; then
        print_success "pnpm 版本正确: $CURRENT_VERSION (与 CI 一致)"
    else
        print_error "pnpm 版本不一致: $CURRENT_VERSION (CI 使用 $REQUIRED_VERSION)"
        echo "  建议: npm install -g pnpm@10.13.1"
        return 1
    fi
}

# 基础检查
run_basic_checks() {
    print_header "📋 基础检查 (Basic Checks)"

    # TypeScript 检查
    print_step "TypeScript 类型检查"
    if pnpm type-check; then
        print_success "TypeScript 检查通过"
    else
        print_error "TypeScript 检查失败"
        return 1
    fi

    # 测试文件类型检查
    print_step "测试文件类型检查"
    if pnpm type-check:tests; then
        print_success "测试文件类型检查通过"
    else
        print_error "测试文件类型检查失败"
        return 1
    fi

    # 代码格式检查
    print_step "代码格式检查 (Prettier)"
    if pnpm format:check; then
        print_success "代码格式检查通过"
    else
        print_error "代码格式检查失败"
        echo "  修复: pnpm format:write"
        return 1
    fi

    # 代码质量检查
    print_step "代码质量检查 (ESLint)"
    if pnpm lint:check; then
        print_success "代码质量检查通过"
    else
        print_error "代码质量检查失败"
        echo "  修复: pnpm lint:fix"
        return 1
    fi

    # 构建检查
    print_step "构建检查 (Next.js Build)"
    if pnpm build:check; then
        print_success "构建检查通过"
    else
        print_error "构建检查失败"
        return 1
    fi
}

# 单元测试（带覆盖率）
run_unit_tests() {
    print_header "🧪 单元测试 (Unit Tests)"

    print_step "运行单元测试（覆盖率模式）"
    if pnpm test:coverage; then
        print_success "单元测试通过"
    else
        print_error "单元测试失败"
        return 1
    fi
}

# 企业级质量门禁（单一权威源）
run_quality_gate() {
    print_header "🎯 企业级质量门禁 (Quality Gate)"
    echo -e "${BLUE}阈值由 scripts/quality-gate.js 统一管理${NC}"

    if [ "$QUICK_MODE" = "true" ]; then
        print_step "运行质量门禁检查（快速模式）"
        if pnpm quality:gate:fast; then
            print_success "质量门禁通过（快速模式）"
        else
            print_error "质量门禁失败"
            echo "  说明: 质量门禁包含严格的代码质量标准"
            echo "  - 禁止使用 any 类型"
            echo "  - 警告数量需控制在 500 个以下"
            echo "  - 所有 TypeScript 错误必须修复"
            return 1
        fi
    else
        print_step "运行质量门禁检查（完整模式，跳过测试执行）"
        # --skip-test-run: 复用 run_unit_tests 生成的覆盖率报告，避免重复执行测试
        if pnpm quality:gate -- --skip-test-run; then
            print_success "质量门禁通过"
        else
            print_error "质量门禁失败"
            echo "  说明: 质量门禁包含严格的代码质量标准"
            echo "  - 禁止使用 any 类型"
            echo "  - 警告数量需控制在 500 个以下"
            echo "  - 所有 TypeScript 错误必须修复"
            echo "  - 测试覆盖率需达标（见 scripts/quality-gate.js）"
            return 1
        fi
    fi
}

# E2E 测试
run_e2e_tests() {
    print_header "🎭 E2E 测试 (End-to-End Tests)"

    if [ "$QUICK_MODE" = "true" ]; then
        print_skip "E2E 测试（快速模式跳过）"
        return 0
    fi

    print_step "运行 E2E 测试 (Playwright)"
    if CI=1 pnpm test:e2e; then
        print_success "E2E 测试通过"
    else
        print_error "E2E 测试失败"
        return 1
    fi
}

# 性能检查
run_performance_checks() {
    print_header "⚡ 性能检查 (Performance Checks)"

    if [ "$QUICK_MODE" = "true" ]; then
        print_skip "性能检查（快速模式跳过）"
        return 0
    fi

    # Lighthouse CI 检查
    print_step "Lighthouse CI 性能检查"
    echo "  说明: 需要启动生产服务器，预计耗时 5-8 分钟"
    echo "  检查项: Performance, Accessibility, Best Practices, SEO"

    if pnpm exec lhci autorun --config=lighthouserc.js; then
        print_success "Lighthouse CI 检查通过"
    else
        print_error "Lighthouse CI 检查失败"
        echo "  提示: 确保端口 3000 未被占用"
        echo "  提示: 检查 lighthouserc.js 配置和性能阈值"
        return 1
    fi
}

# 安全检查
run_security_checks() {
    print_header "🔒 安全检查 (Security Checks)"

    print_step "依赖安全审计"
    if pnpm security:audit; then
        print_success "安全审计通过"
    else
        print_error "安全审计失败"
        return 1
    fi

    print_step "PII 日志泄露检查"
    if pnpm lint:pii; then
        print_success "PII 检查通过"
    else
        print_error "PII 检查失败 - 发现未脱敏的敏感信息"
        echo "  修复: 使用 sanitizeEmail/sanitizeIP/sanitizeCompany 函数"
        return 1
    fi
}

# 翻译质量检查
run_translation_checks() {
    print_header "🌍 翻译质量检查 (Translation Quality)"

    print_step "翻译文件验证"
    if pnpm validate:translations; then
        print_success "翻译验证通过"
    else
        print_error "翻译验证失败"
        return 1
    fi

    print_step "复制翻译资源"
    if node scripts/copy-translations.js; then
        print_success "翻译资源复制通过"
    else
        print_error "翻译资源复制失败"
        return 1
    fi

    print_step "i18n 形状等价检查"
    if pnpm i18n:shape:check; then
        print_success "i18n 形状检查通过"
    else
        print_error "i18n 形状检查失败"
        return 1
    fi

    print_step "MDX slug 对齐校验"
    if pnpm content:slug-check; then
        print_success "MDX slug 检查通过"
    else
        print_error "MDX slug 检查失败"
        return 1
    fi
}

# 架构检查
run_architecture_checks() {
    print_header "🏗️  架构检查 (Architecture Checks)"

    # 依赖关系检查
    print_step "依赖关系检查"
    if pnpm arch:check; then
        print_success "依赖关系检查通过"
    else
        print_error "依赖关系检查失败"
        return 1
    fi

    # 循环依赖检查
    print_step "循环依赖检查"
    if pnpm circular:check; then
        print_success "循环依赖检查通过"
    else
        print_error "循环依赖检查失败"
        return 1
    fi
}

# 打印总结
print_summary() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    print_header "📊 检查总结 (Summary)"

    echo -e "总检查数: ${BLUE}$TOTAL_CHECKS${NC}"
    echo -e "通过: ${GREEN}$PASSED_CHECKS${NC}"
    echo -e "失败: ${RED}$FAILED_CHECKS${NC}"
    echo -e "跳过: ${YELLOW}$SKIPPED_CHECKS${NC}"
    echo -e "耗时: ${BLUE}${DURATION}s${NC}"

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ 所有检查通过！代码可以安全提交和推送。${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        exit 0
    else
        echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}❌ 发现 $FAILED_CHECKS 个失败的检查，请修复后重试。${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        exit 1
    fi
}

# 主函数
main() {
    print_header "🚀 本地 CI 完整检查开始"

    echo "模式: ${QUICK_MODE:+快速模式}${QUICK_MODE:-完整模式}"
    echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${BLUE}质量阈值: scripts/quality-gate.js (单一权威源)${NC}"
    echo ""

    # 环境检查
    check_node_version || exit 1
    check_pnpm_version || exit 1

    # 运行所有检查（与 GitHub CI 对齐）
    run_basic_checks || exit 1
    run_unit_tests || exit 1
    run_quality_gate || exit 1
    run_e2e_tests || exit 1
    run_performance_checks || exit 1
    run_security_checks || exit 1
    run_translation_checks || exit 1
    run_architecture_checks || exit 1

    # 打印总结
    print_summary
}

# 解析参数
QUICK_MODE=false
if [ "$1" = "--quick" ] || [ "$1" = "-q" ]; then
    QUICK_MODE=true
fi

# 运行主函数
main

