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
  
  const [sorts, setSorts] = useState([]);

  const fetchTableData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });
      
      if (search) {
        params.append("search", search);
      }
      
      if (sorts.length > 0) {
        const sortBy = sorts.map(s => s.column).join(",");
        const sortOrder = sorts.map(s => s.order).join(",");
        params.append("sort_by", sortBy);
        params.append("sort_order", sortOrder);
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
  }, [config.uri, config.method, currentPage, limit, search, sorts, enabled]);

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
    setCurrentPage(1); 
  }, []);

  const handleSortChange = useCallback((columnKey) => {
    setSorts(prevSorts => {
      const existingIndex = prevSorts.findIndex(s => s.column === columnKey);
      
      if (existingIndex >= 0) {
        const currentSort = prevSorts[existingIndex];
        
        if (currentSort.order === "asc") {
          const newSorts = [...prevSorts];
          newSorts[existingIndex] = { column: columnKey, order: "desc" };
          return newSorts;
        } else {
          return prevSorts.filter((_, i) => i !== existingIndex);
        }
      } else {
        return [...prevSorts, { column: columnKey, order: "asc" }];
      }
    });
    setCurrentPage(1); 
  }, []);

  return {
    loading,
    error,
    tableData,
    currentPage,
    limit,
    search,
    sorts,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleSortChange,
    refetch: fetchTableData,
  };
};
