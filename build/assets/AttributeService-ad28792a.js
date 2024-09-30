import{ax as i}from"./index-e9055987.js";const V={getProductsWithVariationsAndSupplies:async()=>{if(!i)throw new Error("Supabase client is not initialized");const{data:e,error:r}=await i.from("products").select("*").order("id");if(r)throw r;const{data:t,error:o}=await i.from("product_variations").select("*").order("id");if(o)throw o;const{data:s,error:a}=await i.from("supplies").select("*").order("id");if(a)throw a;const{data:n,error:c}=await i.from("supply_variation").select("*").order("id");if(c)throw c;const{data:p,error:u}=await i.from("product_supplies").select("*");if(u)throw u;const{data:y,error:f}=await i.from("supply_variation_product_variations").select("*");if(f)throw f;return e.map(m=>{const h=t.filter(d=>d.product_id===m.id).map(d=>{const w=y.filter(l=>l.product_variation_id===d.id).map(l=>l.supply_id),v=n.filter(l=>w.includes(l.id)).map(l=>({...l,supply:s.find(E=>E.id===l.supply_id)||null}));return{...d,supplies:v}}),g=p.filter(d=>d.product_id===m.id).map(d=>s.find(w=>w.id===d.supply_id)||null).filter(d=>d!==null);return{...m,variations:h,supplies:g}})},getCategories:async()=>{if(!i)return console.error("Supabase client is not initialized"),[];const{data:e,error:r}=await i.from("categories").select("*").order("id");if(r)return console.error("Error fetching categories:",r),[];const t=new Map;e==null||e.forEach(s=>{t.set(s.id,{...s,subcategories:[]})});const o=[];return t.forEach(s=>{var a;if(s.parent_id===null)o.push(s);else{const n=t.get(s.parent_id);(a=n==null?void 0:n.subcategories)==null||a.push(s)}}),o},getAttributes:async()=>{if(!i)return console.error("Supabase client is not initialized"),[];const{data:e,error:r}=await i.from("attributes").select("*").order("id");if(r)return console.error("Error fetching attributes:",r),[];const{data:t,error:o}=await i.from("attribute_values").select("*").order("id");return o?(console.error("Error fetching attribute values:",o),[]):(e==null?void 0:e.map(s=>({...s,values:(t==null?void 0:t.filter(a=>a.type===s.id))||[]})))||[]},getSupplies:async()=>{const{data:e,error:r}=await i.from("supplies").select(`
          id,
          name,
          type,
          product_id
        `);if(r)return console.error("Error fetching supplies:",r),[];const t=e.map(u=>u.id),{data:o,error:s}=await i.from("supply_variation").select(`
          id,
          cost,
          currency_id,
          description,
          measure,
          created_at,
          supply_id
        `).in("supply_id",t);if(s)return console.error("Error fetching supply variations:",s),[];const a=o.map(u=>u.currency_id),{data:n,error:c}=await i.from("currency").select(`
          id,
          name
        `).in("id",a);return c?(console.error("Error fetching currencies:",c),[]):e.map(u=>{const y=o.filter(f=>f.supply_id===u.id).map(f=>({...f,currency_id:n.find(_=>_.id===f.currency_id)}));return{...u,supply_variation:y}})},getCurrencies:async()=>{const{data:e,error:r}=await i.from("currency").select("*").order("id");return r?(console.error("Error fetching currencies:",r),[]):e||[]},updateCurrency:async(e,r)=>{const{data:t,error:o}=await i.from("currency").update({exchange_rate:r}).eq("id",e).single();if(o)throw console.error("Error updating currency:",o),o;return t},getOrders:async()=>{const{data:e,error:r}=await i.from("orders").select(`
        *,
        items:order_items (
          id,
          quantity,
          price,
          variation:product_variations (
            id,
            name,
            price,
            currency:currencies (*),
            supplies:supply_variation (
              id,
              cost,
              currency:currencies (*),
              description,
              measure
            )
          )
        )
      `).order("created_at",{ascending:!1});return r?(console.error("Error fetching orders:",r),[]):e||[]},saveAttribute:async(e,r=!1)=>{const{id:t,name:o,value:s,shop_id:a}=e;if(r){const{data:n,error:c}=await i.from("attributes").update({name:o,shop_id:a}).eq("id",t);if(c)throw new Error(c.message);for(let p of s){const{error:u}=await i.from("attribute_values").upsert({type:t,value:p.value});if(u)throw new Error(u.message)}return n}else{const{data:n,error:c}=await i.from("attributes").insert({name:o,shop_id:a});if(c)throw new Error(c.message);const p=n[0].id;for(let u of s){const{error:y}=await i.from("attribute_values").insert({type:p,value:u.value});if(y)throw new Error(y.message)}return n}},saveCategory:async(e,r=!1)=>{const{id:t,name:o,description:s,parent_id:a,shop_id:n}=e;if(r){const{data:c,error:p}=await i.from("categories").update({name:o,description:s,parent_id:a,shop_id:n}).eq("id",t);if(p)throw new Error(p.message);return c}else{const{data:c,error:p}=await i.from("categories").insert({name:o,description:s,parent_id:a,shop_id:n});if(p)throw new Error(p.message);return c}},getAllSupplies:async()=>{const{data:e,error:r}=await i.from("supplies").select("*");return r?(console.error("Error fetching supplies:",r),[]):e},getSupplyVariationsBySupplies:async e=>{const{data:r,error:t}=await i.from("supply_variation").select("*").in("supply_id",e);return t?(console.error("Error fetching supply variations:",t),[]):r}};async function q(e){const{data:r,error:t}=await i.from("products").select("*").eq("shop_id",e);if(t)throw t;return r}async function P(e){const{data:r,error:t}=await i.from("supplies").select("*").eq("shop_id",e);if(t)throw t;return r}async function W(e){const{data:r,error:t}=await i.from("product_supplies").select("*").eq("shop_id",e);if(t)throw t;return r}async function C(e,r,t,o){const{data:s,error:a}=await i.from("product_supplies").insert([{product_id:e,supply_id:r,required_supplies:t,shop_id:o}]);if(a)throw a;return s}async function A(e,r){const{data:t,error:o}=await i.from("product_supplies").delete().match({product_id:e,supply_id:r});if(o)throw o;return t}export{q as a,P as b,C as c,A as d,W as g,V as s};
