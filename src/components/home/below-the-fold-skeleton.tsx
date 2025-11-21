/**
 * Below-the-fold Skeleton Loader
 *
 * 用于在 below-the-fold 内容加载期间显示占位骨架屏
 * 解决 CLS (Cumulative Layout Shift) 问题
 *
 * 目标：预留准确的空间，避免内容突然插入导致布局跳动
 */

/**
 * TechStack Section Skeleton
 * 估算高度: ~900-1200px
 */
function TechStackSkeleton() {
  return (
    <section
      id='tech-stack'
      className='cv-800 py-20'
    >
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          {/* 标题骨架 */}
          <div className='mb-12 text-center'>
            <div className='mx-auto h-10 w-64 animate-pulse rounded-lg bg-muted' />
            <div className='mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-muted' />
          </div>

          {/* Tabs 骨架 */}
          <div className='mb-8 grid w-full grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-7'>
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className='h-10 animate-pulse rounded-lg bg-muted'
              />
            ))}
          </div>

          {/* 卡片网格骨架 (3 列 x 2 行 = 6 张卡片) */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='space-y-3 rounded-lg border bg-card p-6'
              >
                {/* CardHeader */}
                <div className='flex items-center justify-between'>
                  <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                  <div className='h-6 w-16 animate-pulse rounded bg-muted' />
                </div>
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
              </div>
            ))}
          </div>

          {/* 统计区骨架 */}
          <div className='mt-12 rounded-lg border bg-card p-6'>
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='text-center'
                >
                  <div className='mx-auto mb-2 h-8 w-16 animate-pulse rounded bg-muted' />
                  <div className='mx-auto h-4 w-24 animate-pulse rounded bg-muted' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Component Showcase Skeleton
 * 估算高度: ~800-1000px
 */
function ComponentShowcaseSkeleton() {
  return (
    <section
      id='demo'
      className='cv-1000 bg-muted/30 py-20'
    >
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          {/* 标题骨架 */}
          <div className='mb-12 text-center'>
            <div className='mx-auto h-10 w-64 animate-pulse rounded-lg bg-muted' />
            <div className='mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-muted' />
          </div>

          {/* Tabs 骨架 */}
          <div className='mb-8 grid w-full grid-cols-3 gap-2'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='h-10 animate-pulse rounded-lg bg-muted'
              />
            ))}
          </div>

          {/* 展示卡片骨架 (2 列 x 2 行 = 4 张大卡片) */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='space-y-4 rounded-lg border bg-card p-6'
              >
                <div className='h-6 w-48 animate-pulse rounded bg-muted' />
                <div className='h-32 animate-pulse rounded bg-muted' />
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Project Overview Skeleton
 * 估算高度: ~1200-1500px
 */
function ProjectOverviewSkeleton() {
  return (
    <section className='cv-1000 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          {/* 标题骨架 */}
          <div className='mb-12 text-center'>
            <div className='mx-auto h-10 w-64 animate-pulse rounded-lg bg-muted' />
            <div className='mx-auto mt-4 h-6 w-96 animate-pulse rounded-lg bg-muted' />
          </div>

          {/* Feature Grid 骨架 (3 列 x 2 行 = 6 张卡片) */}
          <div className='mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='space-y-3 rounded-lg border bg-card p-6'
              >
                <div className='flex items-center justify-between'>
                  <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                  <div className='h-6 w-12 animate-pulse rounded bg-muted' />
                </div>
                <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
              </div>
            ))}
          </div>

          {/* Project Highlights 大卡片骨架 */}
          <div className='mb-16'>
            <div className='space-y-4 rounded-lg border bg-card p-6'>
              <div className='h-8 w-48 animate-pulse rounded bg-muted' />
              <div className='h-6 w-full animate-pulse rounded bg-muted' />
              <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='h-6 w-full animate-pulse rounded bg-muted'
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Technical Architecture 骨架 (3 列) */}
          <div className='mb-16'>
            <div className='mx-auto mb-8 h-8 w-64 animate-pulse rounded bg-muted' />
            <div className='grid gap-6 lg:grid-cols-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='space-y-3 rounded-lg border bg-card p-6'
                >
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 animate-pulse rounded-full bg-muted' />
                    <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                  </div>
                  <div className='h-4 w-full animate-pulse rounded bg-muted' />
                  <div className='flex flex-wrap gap-1'>
                    {[...Array(5)].map((__, j) => (
                      <div
                        key={j}
                        className='h-6 w-16 animate-pulse rounded bg-muted'
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA 卡片骨架 */}
          <div className='text-center'>
            <div className='mx-auto max-w-2xl space-y-4 rounded-lg border bg-card p-6'>
              <div className='mx-auto h-8 w-48 animate-pulse rounded bg-muted' />
              <div className='mx-auto h-6 w-96 animate-pulse rounded bg-muted' />
              <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                <div className='h-12 w-40 animate-pulse rounded bg-muted' />
                <div className='h-12 w-40 animate-pulse rounded bg-muted' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Call to Action Skeleton
 * 估算高度: ~600-800px
 */
function CallToActionSkeleton() {
  return (
    <section className='cv-600 bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          {/* 主要 CTA 骨架 */}
          <div className='mb-16 text-center'>
            {/* Badge */}
            <div className='mb-6'>
              <div className='mx-auto h-8 w-32 animate-pulse rounded-full bg-muted' />
            </div>

            {/* 标题 */}
            <div className='mx-auto mb-6 h-12 w-96 animate-pulse rounded bg-muted' />
            <div className='mx-auto mb-8 h-6 w-[32rem] animate-pulse rounded bg-muted' />

            {/* 按钮组 */}
            <div className='mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <div className='h-14 w-48 animate-pulse rounded bg-muted' />
              <div className='h-14 w-48 animate-pulse rounded bg-muted' />
            </div>

            {/* 统计数据 */}
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='text-center'
                >
                  <div className='mx-auto mb-2 h-8 w-16 animate-pulse rounded bg-muted' />
                  <div className='mx-auto h-4 w-24 animate-pulse rounded bg-muted' />
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards 骨架 */}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='space-y-3 rounded-lg border bg-card p-6'
              >
                <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 主骨架屏组件
 *
 * 组合所有 section 的骨架屏，保持与实际组件相同的高度和布局
 */
export function BelowTheFoldSkeleton() {
  return (
    <>
      <TechStackSkeleton />
      <ComponentShowcaseSkeleton />
      <ProjectOverviewSkeleton />
      <CallToActionSkeleton />
    </>
  );
}
