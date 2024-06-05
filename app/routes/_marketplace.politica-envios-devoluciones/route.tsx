import { Link, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";

import { useShoppingCart } from "~/providers/ShoppingCartContext";
import classNames from "~/utils/classNames";
import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import { Fetcher } from "~/utils/fetcher";
import SelectBox from "~/components/SelectBox";
import {
  algoliaSearchClient,
  algoliaProductsIndex,
} from "~/utils/algoliaClients";

const returnsPoliciesList = [
  {
    name: "Alimentos y bebidas",
    title:
      "Todos los productos de esta categoría tienen devolución siempre que estén sin consumir y cuenten con algún daño o caducidad vencida.",
  },
  {
    name: "Animales y mascotas",
    title: "Seres vivos no tiene devolución.",
  },
  {
    name: "Accesorios y juguetes",
    title:
      "Tienen devolución siempre que estén sin usar y cuenten con algún daño o defecto..",
  },
  {
    name: "Artículos para adultos",
    title: "No tienen devolución.",
  },
  {
    name: "Bebés",
    title:
      "Todos los productos de esta categoría tienen devolución siempre que estén en su paquete original y sin usar, y cuenten con algún defecto o daño.",
  },
  {
    name: "Belleza y cuidado personal",
    title: `- Depilación, - Farmacia, - Higiene personal, - Productos de barbería, - Tratamientos de belleza. No tienen devolución.<br/>
      - Maquillaje - Perfumes y fragancias. Tienen devolución siempre que estén en su paquete original cerrado y sin usar y cuenten con algún defecto o daño.<br/>
      - Artículos de peluquería, - Cuidado de la piel, - Cuidado del cabello, - Electrodomésticos de belleza, - Manicure y pedicure. Tienen devolución siempre que estén sin usar y/o cuenten con algún defecto o daño.`,
  },
  {
    name: "Boletos para eventos",
    title: `Todos los productos de esta categoría, no tienen devolución.`,
  },
  {
    name: "Hogar, muebles y jardín",
    title: `- Plantas naturales y/o artificiales. No tienen devolución.`,
  },
  {
    name: "Hogar, muebles y jardín",
    title: `- Plantas naturales y/o artificiales. No tienen devolución.<br/>
      - Cuidado del hogar y lavandería. Tienen devolución siempre que estén en su paquete original y sin usar y/o cuenten con algún defecto o daño.`,
  },
  {
    name: "Inmuebles",
    title: `Todos los productos de esta categoría, no tienen devolución.`,
  },
  {
    name: "Joyas y relojes",
    title: `Todos los productos de esta categoría tienen devolución siempre que estén en su paquete original y sin usar y/o cuenten con algún defecto o daño.`,
  },
  {
    name: "Libros, revistas y comics",
    title: `Todos los productos de esta categoría, no tienen devolución.`,
  },
  {
    name: "Ropa, bolsas y calzado",
    title: `Todos los productos de esta categoría, tienen devolución siempre que estén sin usar y con su etiqueta original y/o cuenten con algún defecto o daño.`,
  },
  {
    name: "Salud y equipamiento médico",
    title: `- Equipamiento médico, - Farmacia, - Material de laboratorio, - Ortopedia, - Oxigenoterapia, - Terapias alternativas. No tienen devolución<br/>
      - Andaderas, - Balanzas, - Bastones, - Elevadores de pacientes, - Luces sanitizantes, - Muletas, - Masajes, - Nebulizadores, - Pastilleros, - Sillas de ruedas, - Tensiómetros, - Termómetros. Tienen devolución siempre que estén sin usar.`,
  },
  {
    name: "Servicios",
    title: `Todos los servicios de esta categoría,no tienen devolución.`,
  },
  {
    name: "Vehículos",
    title: `Todos los productos de esta categoría, no tienen devolución.<br/>
      El tiempo para hacer valida una devolución depende de la garantía del producto, sin embargo queda establecido que el cliente cuenta con máximo 7 días hábiles a partir de recibido el producto para realizar aclaración o reclamo por algún pedido.`,
  },
  {
    name: "Si el producto diferente de lo que pediste",
    title: `- Debe estar sin marcas de mal uso y tal cual lo recibiste. - Debe tener sus accesorios, manuales y etiquetas. En caso de contener todos los accesorios o partes se devolverá el proporcional que se considere. - Si es un celular, notebook, Tablet o smartwatch, debe estar desbloqueado, sin claves que impidan su uso.`,
  },
  {
    name: "Si el producto tiene un problema o está incompleto",
    title: `- Cuando lo devuelvas y lo revisemos, debe estar en las mismas condiciones que describas al reclamar.
      En caso de reembolso por cancelación.  El reembolso del dinero se efectuará en el mismo medio de pago y/o cuenta bancaria que usaste para comprar de acuerdo a las condiciones de devoluciones.`,
  },
];
const refundPoliciesList = [
  {
    name: "Efectivo, transferencia o depósito",
    title:
      "Transferencia. Inmediato.",
  },
  {
    name: "Tarjeta de crédito",
    title: "Entre 2 y 14 días (el plazo depende del banco). Tarjeta de débito.",
  },
  {
    name: "Tarjeta de débito",
    title:
      "Entre 2 y 14 días (el plazo depende del banco).",
  }
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser(request).catch((err) => {
    console.log(err);
    return null;
  });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user?.token, request);

  // Get store details
  let error = null;
  const storeDetails = await myFetcher
    .fetch(`${getEnv().API_URL}/productsentrepreneurs/${params.storeId}`, {
      method: "GET",
    })
    .catch((err) => {
      console.log(err);
      // throw new Error("Error fetching product data");
      error = null;
    });

  // Return 404 if product not found
  if (error || !storeDetails) {
    return redirect("404", 404);
  }

  // Get related products
  // const relatedProducts = await myFetcher
  //   .fetch(`${getEnv().API_URL}/products/related/${params.productId}`, {
  //     method: "GET",
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     // throw new Error("Error fetching product data");
  //     error = null;
  //   });

  if (!storeDetails?.entrepreneur) {
    return redirect("404", 404);
  }

  // Search for indexed products at algolia
  const algoliaIndex = algoliaSearchClient.initIndex(algoliaProductsIndex);
  const storeCatalog = await algoliaIndex
    .search("", {
      facetFilters: [`brand.brand:${storeDetails.entrepreneur.brand}`],
      hitsPerPage: 20,
    })
    .catch((err) => {
      console.error("Error:", err);
    });

  // Return loader data
  return {
    storeDetails: storeDetails?.entrepreneur,
    storeCatalog: storeCatalog.hits || [], //storeDetails?.products,
    relatedProducts: [],
  };
}

export default function StorePage() {
  // Product details
  const { storeDetails, storeCatalog } = useLoaderData<typeof loader>();

  // Return main component
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Política de pagos, envíos y devoluciones
        </h1>
        
        <div className="mt-10">
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">
            Envíos
          </h2>
          <p className="mt-6">
            En México Limited el costo de envío es determinado por el peso
            volumétrico del producto vendido, así como el tipo de guía y
            paquetes seleccionados. En ciertas ocasiones se puede solicitar un
            cargo adicional si la dirección de entrega es Zona Extendida. El
            costo será determinado por los mapas y zonas de cobertura de las
            paqueterías con prestación de servicios en México. Si tu dirección
            de entrega es zona extendida se puede optar por hacer la entrega en
            la sucursal más cercana de la paquetería propuesta por la empresa
            México Limited.
          </p>
          <ul role="list" className="mt-8 max-w-2xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <CheckCircleIcon
                className="mt-1 h-5 w-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  ¿Cuándo me llega mi compra?
                </strong>{" "}
                Después de recibir tu pago el producto solicitado dentro de la
                plataforma México Limtied se enviará en los siguientes 1 o 3
                días hábiles, según lo haya configurado el vendedor. El tiempo
                de entrega normalmente es 1 a 4 días hábiles en zonas normales y
                de 3 a 7 días hábiles en zonas extendidas. NOTAS: No procesamos
                pedidos en días festivos de acuerdo al calendario mexicano, ni
                sábados ni domingos.
              </span>
            </li>
          </ul>
          
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">
            Política y garantía de satisfacción.
          </h2>
          <div className="mt-10">
            <p className="mt-6">
              Todas las compras incluyen la garantía de entrega con tu paquete
              seguro y completo en el domicilio seleccionado como punto de
              destino. "México Limited" no se hace responsable por la ejecución
              de garantías de los artículos adquiridos en la plataforma; más sin
              embargo haremos nuestros mayores esfuerzos para proporcionar al
              comprador los detalles de contacto del fabricante, así como
              cualquier otra información necesaria que pudiéramos tener; el
              fabricante será quien de forma directa garantice el producto por
              el tiempo que él indique en la página web y correrá a partir de la
              fecha de pago, la garantía podrá efectuarse por defecto de
              fábrica, y se validara según lo establezca en comunicación directa
              con El Creador, conforme al periodo que este último establezca
              directamente.
            </p>
            <p className="mt-6">
              El cliente cuenta con máximo 7 días hábiles a partir de recibido
              el producto para solicitar la garantía; además el producto se
              tiene que encontrar sellado. En el caso de haber recibido un
              producto y no quedes satisfecho debido a que el producto llego
              dañado, que no corresponda con el solicitado en la plataforma de
              "México Limited", esta última realizará las gestiones pertinentes
              con el fabricante, respecto al cambio y envío correcto de la
              mercancía solicitada gasto que deberá ser cubierto por el
              fabricante, por lo que "México Limited" se compromete a servir
              como intermediario entre comprador y fabricante para una óptima
              resolución, así mismo se solicitara datos necesarios mediante
              correo electrónico mencionando la siguiente información:
            </p>
            <ul
              role="list"
              className="list-inside list-disc mt-8 max-w-2xl space-y-2 text-gray-600"
            >
              <li className="">Número de pedido.</li>
              <li className="">Nombre del cliente.</li>
              <li className="">Código de rastreo.</li>
              <li className="">
                Indicar el producto solicitado originalmente.
              </li>
              <li className="">Anexar imagen del producto recibido.</li>
            </ul>

            <p className="mt-6">
              Posterior a ser recibida dicha información se le responderá vía
              correo electrónico el proceso u opciones a convenir para
              solucionar el percance.
            </p>

            <p className="mt-6">
              En caso de solicitar la factura de un producto. Las facturas son
              electrónicas y se envían al correo registrado en máximo 5 días
              hábiles después de solicitarla con su información completa. En
              caso de cualquier inconveniente con tu facturación por favor
              comunícate al número de atención a clientes. Las compras que sean
              realizadas dentro del mismo mes tienen que ser enviadas más tardar
              el día 30 o 31 del mismo mes antes de las 12:00 pm de lo contrario
              será emitida al siguiente día. Solicitar la factura al correo de
              atención anexando los siguientes datos:
            </p>
            <ul
              role="list"
              className="list-inside list-disc mt-8 max-w-2xl space-y-2 text-gray-600"
            >
              <li className="">RFC.</li>
              <li className="">Razón social.</li>
              <li className="">Tipo de pago.</li>
              <li className="">CDFI.</li>
              <li className="">Domicilio completo y teléfono de contacto.</li>
            </ul>

            <p className="mt-6">
              La garantía de un producto no será válida bajo las siguientes
              condiciones:
            </p>
            <ol
              role="list"
              className="list-inside list-disc mt-8 max-w-2xl space-y-2 text-gray-600"
            >
              <li className="">
                Cuando el uso, cuidado y operación del producto no haya sido
                realizado de manera adecuada, conforme a las instrucciones
                contenidas en el instructivo de operación que el fabricante
                podrá incluir en el sitio web de "México Limited".
              </li>
              <li className="">
                En caso de que el producto haya sido usado fuera de su
                capacidad, maltratado, golpeado, expuesto a la humedad, mojado
                por algún líquido o substancia corrosiva, así como por
                cualquiera otra falla atribuible al consumidor.{" "}
              </li>
              <li className="">
                Cuando la falla sea originada por el desgaste normal de las
                piezas debido al uso. Ninguna otra garantía verbal o escrita
                diferente a la aquí expresada será reconocida por "México
                Limited".
              </li>
              <li className="">
                Se deberá informar a "México Limited" sobre los desperfectos
                para iniciar el proceso de disputa con el fabricante y poder
                hacer valida la Garantía y regresar el producto con todos sus
                accesorios (manuales, cables, software, batería, audífonos,
                etc.) y dentro de su empaque original, así mismo, éste no deberá
                de tener ningún tipo de escrito, ralladura, ni etiquetas pegadas
                diferentes a las originales.{" "}
              </li>
              <li className="">
                En caso de no incluir accesorios completos no se aplicará
                ninguna garantía.
              </li>
            </ol>
          </div>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">
            Política de devolución de compras
          </h2>
          <div className="mt-10">
            <p className="mt-6">
              Se puede aplicar una devolución y/o cambio de la compra en caso de
              que:
            </p>
            <ul
              role="list"
              className="list-inside list-disc mt-8 max-w-2xl space-y-2 text-gray-600"
            >
              <li>Llegue un producto con fecha de caducidad vencida.</li>
              <li>El producto llegue dañado.</li>
              <li>La paquetería pierda o dañe tu compra.</li>
              <li>Se haya enviado un producto erróneo</li>
            </ul>
            <p className="mt-6">
              En caso de que el cliente haya realizado una compra errónea, ya
              sea en el sabor o modelo del producto seleccionado o un artículo
              del que ya se arrepintió, se puede realizar el cambio
              correspondiente. Para esto el producto debe ser regresado sellado
              y el cliente deberá cubrir los gastos de envío de la devolución y
              del envío del nuevo paquete.
            </p>

            <h3 className="mt-16 text-xl font-bold tracking-tight text-gray-900">
              Proceso de devolución
            </h3>
            <p className="mt-6">
              Para hacer valida la devolución es importante que:
            </p>
            <ul
              role="list"
              className="list-inside list-disc mt-8 max-w-2xl space-y-2 text-gray-600"
            >
              <li className="">
                Levantar una solicitud al correo atraccion@mexicolimited.com.mx,
                con el asunto "Solicitud de devolución" + el número de tu
                pedido.
              </li>
              <li className="">
                Enviar imágenes y/o videos con la evidencia del producto
                sellado.
              </li>
              <li className="">
                El equipo de atención a clientes determinará si el pedido es
                apto para la devolución y enviará las instrucciones específicas
                para la devolución.
              </li>
            </ul>
            <p className="mt-6">
              El cliente cuenta con máximo 7 días hábiles a partir de recibido
              el producto para realizar aclaración o reclamo por algún pedido.
            </p>

            <p className="mt-6">
              “MÉXICOLIMITED” no será responsable de las garantías
              proporcionadas por el fabricante. Sin embargo, haremos nuestros
              mayores esfuerzos para proporcionarle los detalles de contacto del
              fabricante, así como cualquier información necesaria que
              pudiéramos tener que sirva para la resolución del caso.
            </p>

            <p className="mt-6">
              Las garantías del fabricante podrán ser efectivas siempre y cuando
              el producto en cuestión cuente con un defecto de fábrica, fallo o
              daño de creación y atendiendo los argumentos presentados en la
              siguiente tabla.
            </p>
            <div className="-mx-4 mt-8 sm:-mx-0">
              <table className="mt-6 min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Categoría / Producto
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                    >
                      Condiciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {returnsPoliciesList.map((policy) => (
                    <tr key={policy.email}>
                      <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-52 sm:max-w-none sm:pl-0">
                        {policy.name}
                        <dl className="font-normal lg:hidden">
                          <dt className="sr-only">Categoría / Producto</dt>
                          <dd className="mt-1 truncate text-gray-700">
                            {policy.title}
                          </dd>
                          <dt className="sr-only sm:hidden">Condiciones</dt>
                          <dd className="mt-1 truncate text-gray-500 sm:hidden">
                            {policy.email}
                          </dd>
                        </dl>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                        {policy.title}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-16 text-xl font-bold tracking-tight text-gray-900">
              Política de reembolsos.
            </h3>
            <div className="mt-10">
              <div className="-mx-4 mt-8 sm:-mx-0">
                <table className="mt-6 min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Cómo pagaste
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                      >
                        Dónde recibes el reembolso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {refundPoliciesList.map((policy) => (
                      <tr key={policy.email}>
                        <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-52 sm:max-w-none sm:pl-0">
                          {policy.name}
                          <dl className="font-normal lg:hidden">
                            <dt className="sr-only">Cómo pagaste</dt>
                            <dd className="mt-1 truncate text-gray-700">
                              {policy.title}
                            </dd>
                            <dt className="sr-only sm:hidden">Dónde y cuándo recibes el reembolso</dt>
                            <dd className="mt-1 truncate text-gray-500 sm:hidden">
                              {policy.email}
                            </dd>
                          </dl>
                        </td>
                        <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                          {policy.title}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
