import { lazy } from "react";
import { APP_PREFIX_PATH } from "@/constants/route.constant";
import { OWNER, SELLER } from "@/constants/roles.constant";
import type { Routes } from "@/@types/routes";

const appsRoute: Routes = [
  {
    key: "appsSales.checkout",
    path: `${APP_PREFIX_PATH}/sales/checkout`,
    component: lazy(() => import("@/views/orders/PageCheckout/CheckoutPage")),
    authority: [OWNER],
  },
  {
    key: "appsSales.delivery",
    path: `${APP_PREFIX_PATH}/sales/delivery`,
    component: lazy(() => import("@/views/orders/Delievery/index")),
    authority: [OWNER, SELLER],
  },
  {
    key: "appsSales.profit",
    path: `${APP_PREFIX_PATH}/sales/profit`,
    component: lazy(() => import("@/views/sales/ProfitTables/index")),
    authority: [OWNER],
  },
  {
    key: "appsSales.dashboard",
    path: `${APP_PREFIX_PATH}/sales/dashboard`,
    component: lazy(() => import("@/views/sales/SalesDashboard")),
    authority: [OWNER],
  },
  {
    key: "appsSales.productList",
    path: `${APP_PREFIX_PATH}/sales/product-list`,
    component: lazy(() => import("@/views/inventory/Product/ProductList")),
    authority: [OWNER, SELLER],
  },
  {
    key: "appsSales.attributeList",
    path: `${APP_PREFIX_PATH}/sales/attributes`,
    component: lazy(() => import("@/views/inventory/Attributes")),
    authority: [OWNER, SELLER],
  },
  {
    key: "appsSales.productsAttributes",
    path: `${APP_PREFIX_PATH}/sales/products-attributes`,
    component: lazy(() => import("@/views/inventory/Attributes")),
    authority: [OWNER, SELLER],
  },
  {
    key: "appsSales.storeList",
    path: `${APP_PREFIX_PATH}/sales/store-lists`, //
    component: lazy(() => import("@/views/inventory/Product/StoresProduct")), // VISTA PARA TIENDAS CONECTADAS
    authority: [OWNER, SELLER],
  },
  {
    key: "appsSales.productEdit",
    path: `${APP_PREFIX_PATH}/sales/product-edit/:productId`,
    component: lazy(
      () => import("@/views/inventory/Product/ProductEdit/index")
    ),
    authority: [OWNER, SELLER],
    meta: {
      header: "Edit Product",
    },
  },
  {
    key: "appsSales.productEdit",
    path: `${APP_PREFIX_PATH}/sales/delievery/`,
    component: lazy(() => import("@/views/inventory/Delievery")),
    authority: [OWNER],
    meta: {
      header: "Edit Product",
    },
  },
  {
    key: "appsSales.productNew",
    path: `${APP_PREFIX_PATH}/sales/product-new`,
    component: lazy(() => import("@/views/inventory/Product/ProductNew")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Add New Product",
    },
  },
  {
    key: "appsSales.offerForm",
    path: `${APP_PREFIX_PATH}/sales/createForm`,
    component: lazy(() => import("@/views/sales/Offers/Form")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Crear Oferta",
    },
  },
  {
    key: "appsSales.offerForm",
    path: `${APP_PREFIX_PATH}/sales/editForm/:id`,
    component: lazy(() => import("@/views/sales/Offers/Form")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Crear Oferta",
    },
  },
  {
    key: "appsSales.offerTable",
    path: `${APP_PREFIX_PATH}/sales/offerTable`,
    component: lazy(() => import("@/views/sales/Offers/Table")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Add New Product",
    },
  },
  {
    key: "appsSales.catalog",
    path: `${APP_PREFIX_PATH}/catalog`,
    component: lazy(() => import("@/views/catalog/productSections")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Add New Product",
    },
  },
  {
    key: "appsSales.slides",
    path: `${APP_PREFIX_PATH}/slides`,
    component: lazy(() => import("@/views/catalog/slides/Tables")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Diapositivas",
    },
  },
  {
    key: "appsSales.Cslides",
    path: `${APP_PREFIX_PATH}/Cslides`,
    component: lazy(() => import("@/views/catalog/slides/components/Create")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Crear Diapositivas",
    },
  },
  {
    key: "appsSales.Eslides",
    path: `${APP_PREFIX_PATH}/Eslides/:id`,
    component: lazy(() => import("@/views/catalog/slides/components/Edit")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Editar Diapositiva",
    },
  },
  {
    key: "appsSales.orderDetails",
    path: `${APP_PREFIX_PATH}/sales/order-details/:orderId`,
    component: lazy(() => import("@/views/sales/OrderDetails")),
    authority: [OWNER],
  },
  {
    key: "appsSales.supplyNew",
    path: `${APP_PREFIX_PATH}/sales/supply-new`,
    component: lazy(() => import("@/views/inventory/Supply/New/index")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Nuevo Insumo",
    },
  },
  {
    key: "appsSales.supplyEdit",
    path: `${APP_PREFIX_PATH}/sales/supply-new/:id`,
    component: lazy(() => import("@/views/inventory/Supply/New")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Editar Insumo",
    },
  },
  // {
  //     key: 'appsSales.supplyEdit',
  //     path: `${APP_PREFIX_PATH}/sales/supply-edit/:supplyId`,
  //     component: lazy(() => import('@/views/inventory/Supply/New/index')),
  //     authority: [OWNER, SELLER],
  //     meta: {
  //         header: 'Edit Supply',
  //     },
  // },

  {
    key: "appsSales.sellerCatalog",
    path: `${APP_PREFIX_PATH}/sales/sellerCatalog`,
    component: lazy(() => import("@/views/crm/SellersCatalog")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Crear Orden",
    },
  },
  {
    key: "appsSales.clients",
    path: `${APP_PREFIX_PATH}/sales/clients`,
    component: lazy(() => import("@/views/crm/SellersClients")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Clientes",
    },
  },
  {
    key: "appsSales.leaderboardSellers",
    path: `${APP_PREFIX_PATH}/sales/leaderboardSellers`,
    component: lazy(() => import("@/views/crm/SellersLeaderboad")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Tabla Insignea",
    },
  },
  {
    key: "appsSales.supplyList",
    path: `${APP_PREFIX_PATH}/sales/supplies`,
    component: lazy(() => import("@/views/inventory/Supply/List")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Lista de Insumos",
    },
  },
  {
    key: "appsSales.categoryList",
    path: `${APP_PREFIX_PATH}/sales/categories`,
    component: lazy(
      () => import("@/views/inventory/Categories/CategoriesList")
    ),
    authority: [OWNER],
  },
  {
    key: "appsSales.currency",
    path: `${APP_PREFIX_PATH}/accounting/currency`,
    component: lazy(() => import("@/views/accounting/Currency")),
    authority: [OWNER],
  },
  {
    key: "appsSales.attributeNew",
    path: `${APP_PREFIX_PATH}/sales/attribute-new`,
    component: lazy(() => import("@/views/inventory/AttributesNew")),
    authority: [OWNER],
    meta: {
      header: "Anadir Nuevo Atributo",
    },
  },
  {
    key: "appsSales.sellerList",
    path: `${APP_PREFIX_PATH}/sales/sellers`,
    component: lazy(() => import("@/views/sales/SellerList")),
    authority: [OWNER],
    meta: {
      header: "Seller List",
    },
  },

  {
    key: "appsSales.orderEdit",
    path: `${APP_PREFIX_PATH}/sales/order-edit/:orderId`,
    component: lazy(() => import("@/views/sales/OrderEdit")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Edit Order",
    },
  },
  {
    key: "appsSales.orderList",
    path: `${APP_PREFIX_PATH}/sales/orders`,
    component: lazy(() => import("@/views/sales/OrderList")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Order List",
    },
  },
  {
    key: "appsAccount.settings",
    path: `${APP_PREFIX_PATH}/account/settings/:tab`,
    component: lazy(() => import("@/views/account/Settings")),
    authority: [OWNER],
    meta: {
      header: "Settings",
      headerContainer: true,
    },
  },
];

export default appsRoute;
