// packages/ui/src/index.ts
// Barrel export for @localmart/ui

export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';

export { Badge, badgeVariants } from './components/badge';
export type { BadgeProps } from './components/badge';

export { Modal } from './components/modal';

export { Table } from './components/table';
export type { ColumnDef, TableProps } from './components/table';

export { Dropdown } from './components/dropdown';
export type { DropdownItem, DropdownProps } from './components/dropdown';

export { Tooltip } from './components/tooltip';
export type { TooltipProps } from './components/tooltip';

export { DocumentPreview } from './components/document-preview';

export { Spinner, PageSpinner } from './components/spinner';

export { StatCard } from './components/stat-card';
export type { StatCardProps } from './components/stat-card';

export { cn } from './lib/utils';
