/**
 * Generate page numbers array with ellipsis for pagination
 * @param {number} current - Current page number
 * @param {number} total - Total number of pages
 * @returns {Array} - Array of page numbers and ellipsis strings
 */
export const getPageNumbers = (current, total) => {
  const pages = [];
  const delta = 2; // Number of pages to show on each side of current page

  if (total <= 7) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    // Calculate start and end of middle range
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    // Adjust if we're near the start
    if (current <= delta + 2) {
      end = Math.min(total - 1, 5);
      start = 2;
    }

    // Adjust if we're near the end
    if (current >= total - delta - 1) {
      start = Math.max(2, total - 4);
      end = total - 1;
    }

    // Add ellipsis before middle range if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add middle range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis after middle range if needed
    if (end < total - 1) {
      pages.push("...");
    }

    // Always show last page if total > 1
    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
};
