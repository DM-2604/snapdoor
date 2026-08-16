'use client';
// components/layout/page-header.tsx

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7 pb-5 border-b border-neutral-200">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
