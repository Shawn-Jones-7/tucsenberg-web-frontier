/**
 * Content Management System - Query Functions - 主入口
 * 重新导出所有内容查询相关模块
 */

// 重新导出过滤函数
export {
  isDraftAllowed,
  matchesFeaturedFilter,
  matchesTags,
  matchesCategories,
  filterPosts,
} from './content-query/filters';

// 重新导出排序和分页函数
export { sortPosts, paginatePosts } from '@/lib/content-query/sorting';

// 重新导出查询函数
export {
  getAllPosts,
  getAllPages,
  getContentBySlug,
  getPostBySlug,
  getPageBySlug,
} from './content-query/queries';

// 重新导出统计函数
export { getContentStats } from '@/lib/content-query/stats';
