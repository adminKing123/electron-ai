import { useState, useEffect, useCallback } from "react";
import api from "../../../../apis";

export const useTableData = (config, enabled = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    config?.query_params?.page || 1,
  );
  const [limit, setLimit] = useState(config?.query_params?.limit || 10);
  const [search, setSearch] = useState(config?.query_params?.search || "");

  const fetchTableData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });
      
      // Add search param if it exists
      if (search) {
        params.append("search", search);
      }
      
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
  }, [config.uri, config.method, currentPage, limit, search, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchTableData();
    }
  }, [fetchTableData, enabled]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((newSearch) => {
    setSearch(newSearch);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  return {
    loading,
    error,
    tableData,
    currentPage,
    limit,
    search,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    refetch: fetchTableData,
  };
};
