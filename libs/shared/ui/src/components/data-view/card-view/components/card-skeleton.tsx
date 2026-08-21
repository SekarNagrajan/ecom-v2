import { theme, Skeleton } from 'antd';

interface CardSkeletonProps {
  columns: number;
  rows?: number;
}

/**
 * GridSkeleton - Shimmer loading state for CardView
 */
export function GridSkeleton({ columns, rows = 5 }: CardSkeletonProps) {
  const { token } = theme.useToken();
  return (
    <div style={{ padding: token.padding }}>
      <div
        style={{
          display: 'grid',
          gap: token.margin,
          gridTemplateColumns: `repeat(${Math.max(
            1,
            columns
          )}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: columns * rows }).map((_, i) => (
          <div key={i}>
            <div
              style={{
                padding: token.padding,
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Skeleton
                active
                avatar
                title={{ width: '60%' }}
                paragraph={{ rows: 2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
