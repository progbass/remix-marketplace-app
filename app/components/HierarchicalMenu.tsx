import React from "react";
import { Link } from "@remix-run/react";
import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch";

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
          onClick={toggleShowMore}
          className="text-indigo-600 hover:text-indigo-500 mt-4"
        >
          {isShowingMore ? "Ver menos" : "Ver más"}
        </button>
      )}
    </>
  );
}

type HierarchicalListProps = Pick<
  ReturnType<typeof useHierarchicalMenu>,
  "items" | "createURL"
> & {
  onNavigate(value: string): void;
};


let counter = 0;
function HierarchicalList({
  items,
  createURL,
  onNavigate,
}: HierarchicalListProps) {
  if (items.length === 0) {
    return null;
  }
  counter++;

  return (
    <div className="space-y-3 pt-6">
      {items.map((item) => (
        <div key={item.value} className="items-center" >
          <input
            id={`${item.value}`}
            // name={`${section.id}[]`}
            // defaultValue={option.value}
            onClick={(event) => {
              if (isModifierClick(event)) {
                return;
              }
              event.preventDefault();

              onNavigate(item.value);
            }}
            checked={item.isRefined}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor={`${item.value}`}
            className="ml-3 text-sm text-gray-600"
            onClick={(event) => {
              if (isModifierClick(event)) {
                return;
              }
              event.preventDefault();

              onNavigate(item.value);
            }}
          >
            {/* <Link
              to={createURL(item.value)}
              
              style={{ fontWeight: item.isRefined ? "bold" : "normal" }}
            > */}
              <span>{item.label}</span>
              <span>{item.count}</span>
            {/* </Link> */}
          </label>

          {item.data && (
            <div className={`pl-8 pb-3`}>
              <HierarchicalList
                items={item.data}
                onNavigate={onNavigate}
                createURL={createURL}
              />
            </div>
          )}
        </div>
      ))}
    </div>
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
