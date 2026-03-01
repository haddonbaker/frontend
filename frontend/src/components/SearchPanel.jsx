import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import FilterModal from "./FilterModal";

function SearchPanel() {
  const [searchInput, setSearchInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isClosingFilters, setIsClosingFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const filterButtonRef = useRef(null);
  const searchButtonRef = useRef(null);

  const isSearchDisabled = searchInput.trim() === "";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (isSearchDisabled) return;
    console.log("Searching for:", searchInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setFiltersOpen(false);
    }
  };

  const handleTooltipEnter = (buttonRef) => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }
  };

  const handleApplyFilters = () => {
    console.log("Filters applied");
    setFiltersApplied(true);
    setIsClosingFilters(true);
    setTimeout(() => {
      setFiltersOpen(false);
      setIsClosingFilters(false);
    }, 300);
  };

  const handleCloseFilters = () => {
    setIsClosingFilters(true);
    setTimeout(() => {
      setFiltersOpen(false);
      setIsClosingFilters(false);
    }, 300);
  };

  const handleResetFilters = () => {
    console.log("Filters reset");
    setFiltersApplied(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>Search Courses</h2>

        <div style={styles.searchRow}>
          <div style={styles.inputWrapper}>
            <Search size={18} style={styles.leftIcon} />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search by course code, name, keyword, professor, or department"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />

            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                style={styles.clearButton}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={styles.buttonWrapper}>
            {searchInput && (
              <button
                ref={searchButtonRef}
                onClick={handleSearch}
                onMouseEnter={() => {
                  handleTooltipEnter(searchButtonRef);
                  setHoveredButton("search");
                }}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.iconButton,
                  backgroundColor: "#1976D2",
                  color: "white",
                }}
                title="Search"
                aria-label="Search courses"
              >
                <Search size={20} />
              </button>
            )}

            <button
              ref={filterButtonRef}
              onClick={() => {
                if (filtersOpen) {
                  handleCloseFilters();
                } else {
                  setFiltersOpen(true);
                  setIsClosingFilters(false);
                }
              }}
              onMouseEnter={() => {
                handleTooltipEnter(filterButtonRef);
                setHoveredButton("filters");
              }}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                ...styles.iconButton,
                backgroundColor: filtersOpen || filtersApplied ? "#E0E7FF" : "#F3F4F6",
                color: filtersOpen || filtersApplied ? "#1976D2" : "#6B7280",
              }}
              title="Add filters"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={20} />
            </button>

            {hoveredButton === "filters" && (
              <div style={{ ...styles.tooltip, left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
                {filtersApplied ? "Filters applied" : "Add filters"}
              </div>
            )}

            {hoveredButton === "search" && (
              <div style={{ ...styles.tooltip, left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
                Search
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <FilterModal
          onClose={handleCloseFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isClosing={isClosingFilters}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    position: "relative",
  },
  panel: {
    padding: "1.25rem",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  heading: {
    color: "#1976D2",
    fontSize: "1.2rem",
    marginTop: 0,
    marginBottom: "1rem",
  },
  searchRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
  },
  input: {
    width: "100%",
    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
    border: "2px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  leftIcon: {
    position: "absolute",
    top: "50%",
    left: "0.75rem",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
    pointerEvents: "none",
  },
  clearButton: {
    position: "absolute",
    top: "50%",
    right: "0.5rem",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#9CA3AF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem",
    transition: "color 0.2s",
  },
  buttonWrapper: {
    position: "relative",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  iconButton: {
    background: "#F3F4F6",
    border: "none",
    borderRadius: "8px",
    padding: "0.65rem",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    position: "fixed",
    transform: "translate(-50%, -100%)",
    background: "rgba(31, 41, 55, 0.95)",
    color: "white",
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 1001,
    animation: "slideUp 0.2s ease-out forwards",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, -80%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (!document.head.querySelector('style[data-animations="true"]')) {
  styleSheet.setAttribute('data-animations', 'true');
  document.head.appendChild(styleSheet);
}

export default SearchPanel;