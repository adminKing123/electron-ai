import { useState, useEffect, useCallback } from "react";
import api from "../../../../apis";

/**
 * Custom hook for fetching and managing paginated table data
 * @param {Object} config - Table configuration object with uri, method, and query_params
 * @returns {Object} - Table data state and handlers
 */
export const useTableData = (config) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    config?.query_params?.page || 1
  );
  const [limit, setLimit] = useState(config?.query_params?.limit || 10);

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });
      const url = `${config.uri}?${params.toString()}`;

      const response = await api({
        method: config.method || "GET",
        url: url,
      });

      setTableData(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch table data");
    } finally {
      setLoading(false);
    }
  }, [config.uri, config.method, currentPage, limit]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  return {
    loading,
    error,
    tableData,
    currentPage,
    limit,
    handlePageChange,
    handleLimitChange,
    refetch: fetchTableData,
  };
};
