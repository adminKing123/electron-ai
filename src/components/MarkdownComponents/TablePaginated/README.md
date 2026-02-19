# Table Paginated Component

A fully responsive, server-driven paginated table component with professional UI and proper code organization.

## 📁 File Structure

```
TablePaginated/
├── index.js                          # Main export file
├── TablePaginatedView.js             # Main component
├── components/                       # UI components
│   ├── TableHeader.js               # Table header with title and rows per page selector
│   ├── TableBody.js                 # Responsive table body (desktop table / mobile cards)
│   ├── PaginationControls.js       # Pagination buttons and page numbers
│   ├── LoadingState.js              # Loading state component
│   ├── ErrorState.js                # Error state component
│   └── EmptyState.js                # Empty state component
├── hooks/                           # Custom React hooks
│   └── useTableData.js             # Custom hook for data fetching and state management
└── utils/                          # Utility functions
    └── paginationHelper.js         # Pagination logic helpers
```

## 🎯 Features

### Mobile Responsive
- **Desktop (>= 640px)**: Traditional table view with full columns
- **Mobile (< 640px)**: Card-based layout with key-value pairs
- **Adaptive Pagination**: Page numbers hidden on very small screens, showing compact page indicator instead

### Server-Driven Pagination
- Fetches data from backend API with page and limit parameters
- Automatic refetch when pagination changes
- Optimized with useCallback and useEffect

### Professional UI
- Material Design icons for pagination controls
- Smart page number display with ellipsis (1 ... 5 6 7 ... 20)
- Loading states with spinner animation
- Error states with visual feedback
- Empty states with helpful icons
- Dark mode support throughout

### Accessibility
- ARIA labels on pagination buttons
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## 📦 Usage

```jsx
import TablePaginatedView from './components/MarkdownComponents/TablePaginated';

const config = {
  table_name: "Employee List",
  uri: "/hrms/employees",
  type: "TABLE_PAGINATED",
  method: "GET",
  query_params: {
    limit: 10,
    page: 1,
  },
};

<TablePaginatedView config={config} />
```

## 🔧 Configuration Object

```typescript
{
  table_name?: string;          // Table title (default: "Table View")
  uri: string;                  // API endpoint
  type: "TABLE_PAGINATED";      // Table type identifier
  method?: string;              // HTTP method (default: "GET")
  query_params?: {
    limit?: number;             // Rows per page (default: 10)
    page?: number;              // Initial page (default: 1)
  }
}
```

## 📊 Expected API Response Format

```typescript
{
  cols: [
    { _k: "employee_id", _v: "ID", _t: "str" },
    { _k: "name", _v: "Name", _t: "str" },
    // ... more columns
  ],
  data: [
    { employee_id: "001", name: "John Doe", ... },
    // ... more rows
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 100
  }
}
```

## 🎨 Responsive Breakpoints

- **xs**: Extra small devices (320px+)
- **sm**: Small devices (640px+) - Table view starts
- **md**: Medium devices (768px+)
- **lg**: Large devices (1024px+)

## 🔄 State Management

The component uses a custom hook `useTableData` that manages:
- Loading state
- Error state
- Table data
- Current page
- Rows per page limit
- Page change handler
- Limit change handler

## 🎭 Component Breakdown

### TableHeader
- Displays table name or "Table View"
- Rows per page dropdown (5, 10, 25, 50, 100)
- Responsive flex layout

### TableBody
- **Desktop**: Traditional HTML table with hover effects
- **Mobile**: Card-based layout showing label-value pairs

### PaginationControls
- First/Last page buttons
- Previous/Next buttons with chevron icons
- Smart page number display
- Entry count information

### State Components
- **LoadingState**: Animated spinner with loading text
- **ErrorState**: Error icon with message
- **EmptyState**: Empty box icon with "No data available"

## 🚀 Performance Optimizations

- `useCallback` for memoized handlers
- `useMemo` implicitly via smart re-renders
- Efficient pagination algorithm
- Minimal re-renders on state changes

## 🎯 Best Practices Implemented

✅ Separation of concerns (components, hooks, utils)
✅ Reusable and composable components
✅ Proper error boundaries
✅ Loading and empty states
✅ Mobile-first responsive design
✅ Accessibility features
✅ Clean code with comments
✅ Type safety through JSDoc
✅ Consistent styling with design system

## 🔗 Integration

This component is integrated with `MdTableViewRenderer.js` which acts as a router for different table types:

```jsx
// MdTableViewRenderer.js
if (tableConfig?.type === "TABLE_PAGINATED") {
  return <TablePaginatedView config={tableConfig} />;
}
```

## 📝 Future Enhancements

- Column sorting
- Column filtering
- Search functionality
- Export to CSV/Excel
- Column visibility toggle
- Sticky header on scroll
- Row selection

---

**Maintained by**: Noney Development Team
**Last Updated**: February 19, 2026
