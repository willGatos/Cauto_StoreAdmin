import { lazy } from "react";
import { APP_PREFIX_PATH } from "@/constants/route.constant";
import { OWNER, SELLER } from "@/constants/roles.constant";
import type { Routes } from "@/@types/routes";

const appsRoute: Routes = [
  {
    key: "appsCrm.dashboard",
    path: `${APP_PREFIX_PATH}/crm/dashboard`,
    component: lazy(() => import("@/views/crm/CrmDashboard")),
    authority: [OWNER],
  },
  {
    key: "appsCrm.customers",
    path: `${APP_PREFIX_PATH}/crm/customers`,
    component: lazy(() => import("@/views/crm/Customers")),
    authority: [OWNER],
    meta: {
      header: "Customers",
    },
  },
  {
    key: "appsCrm.customers",
    path: `${APP_PREFIX_PATH}/crm/customers2`,
    component: lazy(() => import("@/views/sales/ShoppingProducts")),
    authority: [OWNER],
    meta: {
      header: "Customers",
    },
  },
  {
    key: "appsCrm.customerDetails",
    path: `${APP_PREFIX_PATH}/crm/customer-details`,
    component: lazy(() => import("@/views/crm/CustomerDetail")),
    authority: [OWNER],
    meta: {
      header: "Customer Details",
      headerContainer: true,
    },
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
    key: "appsSales.ProductSupply",
    path: `${APP_PREFIX_PATH}/sales/ProductSupply`,
    component: lazy(() => import("@/views/inventory/Supply/ProductSupply")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Add New Product",
    },
  },
  {
    key: "appsSales.catalog",
    path: `${APP_PREFIX_PATH}/catalog`,
    component: lazy(() => import("@/views/catalog/")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Add New Product",
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
      header: "Add New Supply",
    },
  },
  {
    key: "appsSales.supplyEdit",
    path: `${APP_PREFIX_PATH}/sales/supply-new/:id`,
    component: lazy(() => import("@/views/inventory/Supply/New")),
    authority: [OWNER, SELLER],
    meta: {
      header: "Editar Supply",
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
    key: "appsSales.attributeEdit",
    path: `${APP_PREFIX_PATH}/sales/attribute-edit/:attributeId`,
    component: lazy(() => import("@/views/inventory/AttributeEdit")),
    authority: [OWNER],
    meta: {
      header: "Edit Attribute",
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
