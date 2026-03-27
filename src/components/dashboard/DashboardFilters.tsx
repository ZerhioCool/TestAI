"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    router.push(pathname + "?" + createQueryString("q", term));
  };

  const handleFilter = (filter: string) => {
    router.push(pathname + "?" + createQueryString("filter", filter));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
        <Input
          placeholder="Buscar por título del quiz..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 h-14 text-lg rounded-2xl border-2 shadow-sm focus:border-primary/50 bg-background/50 focus:bg-background transition-all"
        />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="relative">
          <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <select
            defaultValue={searchParams.get("filter") ?? "all"}
            onChange={(e) => handleFilter(e.target.value)}
            className="h-14 pl-10 pr-6 rounded-2xl border-2 shadow-sm font-bold bg-background focus:border-primary/50 outline-none cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">Filtro: Todo</option>
            <option value="mine">Mis Quizzes</option>
            <option value="public">Públicos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
