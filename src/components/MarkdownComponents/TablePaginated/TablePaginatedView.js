import { useState } from "react";
import { useTableData } from "./hooks/useTableData";
import CollapsibleHeader from "./components/CollapsibleHeader";
import TableHeader from "./components/TableHeader";
import TableBody from "./components/TableBody";
import PaginationControls from "./components/PaginationControls";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import { useProcessController } from "../../../store/useMessagesStore";

const TablePaginatedView = ({ config, message_id }) => {
  const [isExpanded, setIsExpanded] = useState(
    useProcessController.getState().message_process?.[message_id]?.id ===
      message_id,
  );

  const {
    loading,
    error,
    tableData,
    currentPage,
    limit,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useTableData(config, isExpanded);

  const { cols = [], data = [], pagination = {} } = tableData || {};
  const totalPages = pagination.total
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const hasSearchParam = config?.query_params?.hasOwnProperty("search");

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!tableData || !tableData.cols || !tableData.data) {
      return <EmptyState />;
    }

    return <TableBody cols={cols} data={data} />;
  };

  return (
    <div className="border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden my-2">
      <CollapsibleHeader
        tableName={config?.table_name}
        totalEntries={loading || !isExpanded ? null : pagination.total}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && (
        <>
          {!error && (
            <TableHeader 
              limit={limit} 
              onLimitChange={handleLimitChange}
              search={search}
              onSearchChange={handleSearchChange}
              hasSearch={hasSearchParam}
            />
          )}

          {renderContent()}

          {!error && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              limit={limit}
              total={pagination.total || 0}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TablePaginatedView;
