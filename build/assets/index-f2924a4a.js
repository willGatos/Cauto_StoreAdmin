import{r as p,j as e,aw as N,ax as u}from"./index-e9055987.js";import{B as l}from"./Button-ba65fcd6.js";import"./Alert-102e0217.js";import"./index-48bcc748.js";import"./Badge-9568a8b0.js";import"./Card-433b6df5.js";import"./index-0b16cfb5.js";import"./index-6ec4b8b8.js";import"./Dialog-0f29b530.js";import"./Drawer-1d10f851.js";import"./ScrollBar-7cb0876a.js";import"./FormItem-ea0b05bc.js";import"./Input-cff490ba.js";import"./index-cba86877.js";import"./index-fd641029.js";import"./toast-38b8809c.js";import"./Skeleton-ede84c2e.js";import"./index-6bfd69bd.js";import"./index-ca92c429.js";import"./Select-3959542b.js";import"./Switcher-fc6ab2a0.js";import{T as g}from"./index-95867d9f.js";import"./index-470afdad.js";import"./Tag-0c9ab60f.js";import"./index-b1813226.js";import"./Tooltip-c9ef7fc2.js";import"./Upload-73c59612.js";import{C as _,a as O}from"./chevron-right-32c326f0.js";import{c as E}from"./createLucideIcon-35c01f3b.js";import{T}from"./trash-2-8957055b.js";import"./StatusIcon-879e2680.js";import"./index.esm-1ac4f407.js";import"./CloseButton-3f8e850c.js";import"./motion-4061acbd.js";import"./cloneDeep-860e24f8.js";import"./_Uint8Array-1ce16692.js";import"./_MapCache-0feb66c1.js";import"./Views-51136580.js";import"./_getPrototype-241bf201.js";import"./_baseIsEqual-7de73e16.js";import"./get-c3140d19.js";import"./useControllableState-461bebfa.js";import"./useRootClose-9a8a5c26.js";import"./useDidUpdate-5adca6d0.js";import"./index-1248b5e2.js";import"./warning-6ee4a779.js";import"./useUncertainRef-63de6025.js";import"./isNil-1a93575e.js";import"./index-8f83c5d8.js";/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=E("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]),{TBody:b,THead:S,Td:o,Tr:h,Th:d}=g,j={getOffers:async()=>{const{data:n,error:t}=await u.from("offers").select(`
            id,
            name,
            description,
            start_date,
            end_date,
            products:offer_products (
              id,
              product:products (
                id,
                name
              ),
              variations:offer_product_variations (
                id,
                variation:product_variations (
                  id,
                  name
                ),
                offer_price,
                currency:currency (
                  name,
                  exchange_rate
                )
              )
            )
          `).order("start_date",{ascending:!1});return t?(console.error("Error fetching offers:",t),[]):n.map(i=>({...i,startDate:i.start_date,endDate:i.end_date,products:i.products.map(c=>({id:c.product.id,name:c.product.name,variations:c.variations.map(s=>({id:s.variation.id,name:s.variation.name,offerPrice:s.offer_price,currency:s.currency.name}))}))}))},deleteOffer:async n=>{const{error:t}=await u.from("offers").delete().eq("id",n);t&&console.error("Error deleting offer:",t)}};function Ee(){const[n,t]=p.useState([]),[i,c]=p.useState({}),[s,f]=p.useState(!0);p.useEffect(()=>{x()},[]);const x=async()=>{f(!0);const r=await j.getOffers();t(r),f(!1)},w=r=>{c(a=>({...a,[r]:!a[r]}))},y=r=>{console.log(`Edit offer with id ${r}`)},v=async r=>{window.confirm("Are you sure you want to delete this offer?")&&(await j.deleteOffer(r),x())};return s?e.jsx("div",{children:"Loading..."}):e.jsxs(g,{children:[e.jsx(S,{children:e.jsxs(h,{children:[e.jsx(d,{className:"w-[50px]"}),e.jsx(d,{children:"Name"}),e.jsx(d,{children:"Start Date"}),e.jsx(d,{children:"End Date"}),e.jsx(d,{className:"text-right",children:"Actions"})]})}),e.jsx(b,{children:n.map(r=>e.jsxs(N.Fragment,{children:[e.jsxs(h,{children:[e.jsx(o,{children:e.jsx(l,{variant:"default",size:"sm",onClick:()=>w(r.id),children:i[r.id]?e.jsx(_,{className:"h-4 w-4"}):e.jsx(O,{className:"h-4 w-4"})})}),e.jsx(o,{children:r.name}),e.jsx(o,{children:r.startDate}),e.jsx(o,{children:r.endDate}),e.jsxs(o,{className:"text-right",children:[e.jsx(l,{variant:"default",size:"sm",onClick:()=>y(r.id),children:e.jsx(D,{className:"h-4 w-4"})}),e.jsx(l,{variant:"default",size:"sm",onClick:()=>v(r.id),children:e.jsx(T,{className:"h-4 w-4"})})]})]}),i[r.id]&&e.jsx(h,{children:e.jsx(o,{colSpan:5,children:e.jsxs("div",{className:"p-4 bg-gray-50",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Products:"}),r.products.map(a=>e.jsxs("div",{className:"mb-4",children:[e.jsx("h5",{className:"font-medium",children:a.name}),e.jsx("ul",{className:"list-disc list-inside",children:a.variations.map(m=>e.jsxs("li",{children:[m.name,": ",m.offerPrice," ",m.currency]},m.id))})]},a.id))]})})})]},r.id))})]})}export{Ee as default};
