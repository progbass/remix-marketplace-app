import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";

import type { Product } from "~/types/Product";

import InputText from "~/components/InputText";
import TextArea from "~/components/TextArea";
import SelectBox from "~/components/SelectBox";
import InputLabelList from "~/components/InputLabelList";

// TYPES
interface GeneralInfoProps {
  product: Product;
  categories: Array<{ [key: string]: any }>;
  subcategories: Array<{ [key: string]: any }>;
  onCategoryChange: (categoryId: number) => Promise<any>;
}

// COMPONENT
export default function SectionGeneralInfo({
  product,
  categories,
  subcategories,
  onCategoryChange = async () => {},
}: GeneralInfoProps) {
  const productForm = useFetcher();

  // Categories configuration
  const [selectedCategory, setSelectedCategory] = useState(
    (() => {
      const category = categories.find((cat) => {
        return product.categories.find(
          (prodCat) => prodCat.id === cat.id
        );
      });
      return category || null;
    })()
  );
  const [subcategoryList, setSubcategoryList] = useState(subcategories || []);
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    subcategoryList?.[0] || null
  );
  useEffect(() => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory.id)
        .then((res) => {
          const subcategories = res.length
            ? res
            : [{ id: null, name: "Sin subcategorías" }];

          // Update the subcategories list
          setSubcategoryList(subcategories);

          // Search if the product subcategory exists
          const subcategory = subcategories.find((subcat) => {
            return product.subcategories.find(
              (prodSubcat) => prodSubcat.id === subcat.id
            );
          });

          // Set the selected subcategory
          setSelectedSubcategory(!res.length ? subcategories[0] : subcategory);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedCategory]);

  // Keywords
  const [keywordsList, setKeywordsList] = useState(
    (() => {
      return product.keywords &&
        typeof product.keywords === "string"
        ? product.keywords.split(",")
        : [];
    })()
  );
  const [keywordsValue, setKeywordsValue] = useState(
    (() => {
      return product.keywords
        ? product.keywords
        : "";
    })()
  );
  const onKeywordsListChange = function (keywordsList: Array<string>) {
    setKeywordsValue(keywordsList.join(","));
    setKeywordsList(keywordsList);
  };

 
  // Render component
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      {/* SECTION TITLE */}
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Información General
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          This information will be displayed publicly so be careful what you
          share.
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2" >
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* NAME */}
            <div className="sm:col-span-4">
              <InputText
                id="name"
                name="name"
                type="text"
                label="Nombre"
                autoComplete="name"
                defaultValue={product.name}
                // errors={formErrors?.clabe}
              />

              {/*
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        http://
                      </span>
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="www.example.com"
                      />
                    </div>
                  </div> */}
            </div>

            {/* SHORT DESCRIPTION */}
            <div className="col-span-full">
              <TextArea
                id="short_description"
                name="short_description"
                type="text"
                label="Resumen de tu producto"
                autoComplete="short_description"
                defaultValue={product.short_description}
                rows={5}
                helperText="Write a few sentences about your product."
                // placeholder="Identificador único"
                // errors={formErrors?.short_description}
              />
            </div>

            {/* LONG DESCRIPTION */}
            <div className="col-span-full">
              <TextArea
                id="description"
                name="description"
                type="text"
                label="Descripción detallada"
                autoComplete="description"
                defaultValue={product.description}
                rows={15}
                helperText="Write a few sentences about your product."
                // placeholder="Identificador único"
                // errors={formErrors?.description}
              />
            </div>

            {/* CATEGORY */}
            <div className="col-span-full">
              <SelectBox
                label="Categoría"
                value={selectedCategory}
                onChange={setSelectedCategory}
                optionsList={categories}
              />
              <input
                type="hidden"
                name="category_id"
                defaultValue={selectedCategory?.id || ""}
              />
            </div>

            {/* SUBCATEGORY */}
            <div className="col-span-full">
              <SelectBox
                label="Subcategoría"
                value={selectedSubcategory}
                excludeDefaultOption
                onChange={setSelectedSubcategory}
                optionsList={subcategoryList}
                disabled={subcategoryList.length < 2}
              />
              <input
                type="hidden"
                name="subcategories_id"
                defaultValue={selectedSubcategory?.id || ""}
              />
            </div>

            {/* KEYWORDS */}
            <div className="col-span-full">
              <InputLabelList
                id="keywords"
                label="Palabras clave"
                list={keywordsList}
                value={keywordsValue}
                maxItems={5}
                onListChange={onKeywordsListChange}
                placeholder="Palabras separadas por comas"
                helperText="Máximo cinco palabras clave separadas por comas."
              />
              <input
                type="hidden"
                name="keywords"
                defaultValue={keywordsValue}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
