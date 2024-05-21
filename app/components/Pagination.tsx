import { Link } from "@remix-run/react";
import { usePagination, UsePaginationProps } from "react-instantsearch";
import classNames from "~/utils/classNames";

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
      className="mx-auto mt-6 flex max-w-7xl justify-between px-4 text-sm font-medium text-gray-700 "
    >
      {/* PREVIOUS PAGES BUTTONS  */}
      <div className="flex min-w-0 space-x-2">
        <PaginationItem
          isDisabled={isFirstPage}
          href={createURL(firstPageIndex)}
          onClick={() => refine(firstPageIndex)}
          className={isFirstPage ? "invisible" : ""}
        >
          {"<<"}
        </PaginationItem>

        <PaginationItem
          isDisabled={isFirstPage}
          href={createURL(previousPageIndex)}
          onClick={() => refine(previousPageIndex)}
          className={currentRefinement === 0 ? "invisible" : ""}
        >
          {"<"}
        </PaginationItem>
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
              className={currentRefinement === page ? "font-bold bg-secondary-200 text-secondary-700 border-secondary-300" : ""}
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
          {">"}
        </PaginationItem>
        <PaginationItem
          isDisabled={isLastPage}
          href={createURL(lastPageIndex)}
          onClick={() => refine(lastPageIndex)}
        >
          {">>"}
        </PaginationItem>
      </div>
    </nav>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<"a">, "onClick"> & {
  href: string|undefined;
  onClick: NonNullable<React.ComponentProps<"a">["onClick"]>;
  isDisabled: boolean;
  className?: string;
};

function PaginationItem({
  href = undefined,
  onClick,
  isDisabled,
  className = "",
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
        className={classNames(
          "inline-flex h-10 items-center rounded-md border border-gray-300 bg-white px-4",
          className,
          isDisabled ? "cursor-default hover:bg-gray-100" : "cursor-pointer  focus:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:ring-opacity-25 focus:ring-offset-1 focus:ring-offset-secondary-600"
        )}
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
