import React from "react";
import { Link } from "@remix-run/react";
import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch";
import classNames from "~/utils/classNames";

export default function (props: UseHierarchicalMenuProps) {
  const {
    items,
    refine,
    canToggleShowMore,
    toggleShowMore,
    isShowingMore,
    createURL,
  } = useHierarchicalMenu(props);

  return (
    <>
      <HierarchicalList
        items={items}
        onNavigate={refine}
        createURL={createURL}
      />
      {props.showMore && (
        <button
          disabled={!canToggleShowMore}
          onClick={e => { e.preventDefault(); toggleShowMore(); }}
          className="text-secondary-600 hover:text-secondary-500 mt-4"
        >
          {isShowingMore ? "Ver menos" : "Ver más"}
        </button>
      )}
    </>
  );
}

//
type HierarchicalListProps = Pick<
  ReturnType<typeof useHierarchicalMenu>,
  "items" | "createURL"
> & {
  onNavigate(value: string): void;
};

//
function HierarchicalList({
  items,
  createURL,
  onNavigate,
}: HierarchicalListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="list-none space-y-3 pt-4">

      {items.map((item) => (
        <li key={item.value} className="items-center">
          <a
            href={createURL(item.value)}
            onClick={(event) => {
              if (isModifierClick(event)) {
                return;
              }
              event.preventDefault();

              onNavigate(item.value);
            }}
            // style={{ fontWeight: item.isRefined ? "bold" : "normal" }}
            className={classNames(
              "ml-3 text-sm text-gray-600 hover:text-secondary-600",
              item.isRefined ? "font-bold text-secondary-600" : "font-normal"
            )}
          >
            <span>{item.label}</span>{" "}
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {item.count}
            </span>
          </a>
          
          {item.data && (
            <div className={`pl-8 pb-3`}>
              <HierarchicalList
                items={item.data}
                onNavigate={onNavigate}
                createURL={createURL}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
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
