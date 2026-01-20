// Admin Components - Centralized Export
// Microservice Architecture Pattern: All reusable admin components

// Layout Components
export { PageHeader } from './page-header'
export { FormSheet } from './form-sheet'

// Data Display Components
export { StatsCard, StatsGrid } from './stats-card'
export { DataTable, SearchFilter, FilterButton } from './data-table'
export { StatusBadge, BooleanBadge } from './status-badge'

// Form Components
export { 
  FormField, 
  TextAreaField, 
  SelectField, 
  CheckboxField,
  FormRow 
} from './form-fields'

// Common Components
export {
  LoadingSpinner,
  EmptyState,
  ErrorMessage,
  SuccessMessage,
  ConfirmDialog,
  ActionButtons
} from './common'

// Filter Components
export { FilterTabs, SearchWithFilters } from './filter-tabs'

// Pagination & Export Components
export { Pagination, usePagination } from './pagination'
export { 
  ExportButtons, 
  exportToCSV
} from './export'

// Event-specific Components
export { EventFormSheet } from './event-form-sheet'
export { EventsTable } from './events-table'

// Team-specific Components
export { TeamFormSheet } from './team-form-sheet'
export { TeamsTable } from './teams-table'

