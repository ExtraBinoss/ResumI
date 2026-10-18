import type { Dispatch, SetStateAction } from "react";
import { useOutletContext } from "react-router";

export type LibraryView = {
  search: string;
  setSearch: (query: string) => void;
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
  view: string;
  setView: Dispatch<SetStateAction<string>>;
};
export function useLibraryView() {
  return useOutletContext<LibraryView>();
}
