import { useTableData } from "./hooks/useTableData";
import TableHeader from "./components/TableHeader";
import TableBody from "./components/TableBody";
import PaginationControls from "./components/PaginationControls";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";

const TablePaginatedView = ({ config }) => {
  const {
    loading,
    error,
    tableData,
    currentPage,
    limit,
    handlePageChange,
    handleLimitChange,
  } = useTableData(config);

  if (!loading && error) {
    return <ErrorState error={error} />;
  }

//   if (!loading && (!tableData || !tableData.cols || !tableData.data)) {
  if (true) {
    return <EmptyState />;
  }

  const { cols = [], data = [], pagination = {} } = tableData || {};
  const totalPages = pagination.total ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className="border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden my-2">
      <TableHeader
        tableName={config?.table_name}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <TableBody cols={cols} data={data} />
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        limit={limit}
        total={pagination.total || 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TablePaginatedView;
