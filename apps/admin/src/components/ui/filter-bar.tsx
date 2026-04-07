"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch: (query: string) => void;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;
}

export function FilterBar({
  searchPlaceholder = "Search...", onSearch, filters, onFilterChange, activeFilters = {},
}: FilterBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (val: string) => {
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:outline-none"
        />
        {query && (
          <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {filters?.map((f) => (
        <select
          key={f.key}
          value={activeFilters[f.key] ?? ""}
          onChange={(e) => onFilterChange?.(f.key, e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
