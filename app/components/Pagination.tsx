import { Link } from "@remix-run/react";
import {
  usePagination,
  UsePaginationProps,
} from "react-instantsearch";

//
export default function (props: UsePaginationProps) {
  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL,
  } = usePagination(props);
  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  return (
    <nav
      aria-label="Pagination"
      className="mx-auto mt-6 flex max-w-7xl justify-between px-4 text-sm font-medium text-gray-700 sm:px-6 lg:px-8"
    >
      {/* PREVIOUS PAGES BUTTONS  */}
      <div className="flex min-w-0 space-x-2">
        {!isFirstPage && (
            <PaginationItem
            isDisabled={isFirstPage}
            href={createURL(firstPageIndex)}
            onClick={() => refine(firstPageIndex)}
            >
            Inicio
            </PaginationItem>
        )}

        {currentRefinement > 0 && (
            <PaginationItem
            isDisabled={isFirstPage}
            href={createURL(previousPageIndex)}
            onClick={() => refine(previousPageIndex)}
            >
            Anterior
            </PaginationItem>
        )}
      </div>

      {/* INDIVIDUAL PAGES */}
      <div className="hidden space-x-2 lg:flex">
        {pages.map((page) => {
          const label = page + 1;

          return (
            <PaginationItem
              key={page}
              isDisabled={false}
              aria-label={`Page ${label}`}
              href={createURL(page)}
              onClick={() => refine(page)}
            >
              {label}
            </PaginationItem>
          );
        })}
      </div>

      {/* NEXT PAGES BUTTONS */}
      <div className="flex min-w-0 space-x-2">
        <PaginationItem
          isDisabled={isLastPage}
          href={createURL(nextPageIndex)}
          onClick={() => refine(nextPageIndex)}
        >
          Siguiente
        </PaginationItem>
        <PaginationItem
          isDisabled={isLastPage}
          href={createURL(lastPageIndex)}
          onClick={() => refine(lastPageIndex)}
        >
          Última
        </PaginationItem>
      </div>
    </nav>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<"a">, "onClick"> & {
  onClick: NonNullable<React.ComponentProps<"a">["onClick"]>;
  isDisabled: boolean;
};

function PaginationItem({
  isDisabled,
  href = "",
  onClick,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return (
      <span
        
        className="inline-flex h-10 items-center rounded-md border border-gray-300 text-gray-300 bg-white px-4 cursor: default;"
        {...props}
      />
    );
  }

  return (
    <>
      <Link
        to={href}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }

          event.preventDefault();

          onClick(event);
        }}
        {...props}
        className="inline-flex h-10 items-center rounded-md border border-gray-300 bg-white px-4 hover:bg-gray-100 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-25 focus:ring-offset-1 focus:ring-offset-indigo-600"
      />
    </>
  );
}

function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}
