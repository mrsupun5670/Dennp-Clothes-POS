# Multi-Branch Quick Reference

**Quick lookup for key changes**

---

## 🗄️ Database Changes

```sql
-- Add to: products, categories, colors, sizes, customers

ALTER TABLE table_name
ADD COLUMN shop_id INT NOT NULL DEFAULT 1,
ADD CONSTRAINT fk_table_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_field_per_shop (shop_id, field_name);
```

---

## 🔧 Backend Model Pattern

```typescript
// ✅ Interface
export interface Entity {
  id: number;
  shop_id: number;  // ⭐ ADD
  // ... other fields
}

// ✅ Get method
async getById(id: number, shopId: number): Promise<Entity | null> {
  const results = await query(
    "SELECT * FROM table WHERE id = ? AND shop_id = ?",
    [id, shopId]  // ⭐ Always include shop_id filter
  );
  return results[0] || null;
}

// ✅ Create method
async create(shopId: number, data: Omit<Entity, 'id' | 'shop_id'>): Promise<number> {
  const results = await query(
    "INSERT INTO table (shop_id, ...) VALUES (?, ...)",
    [shopId, ...]  // ⭐ Always include shop_id
  );
  return results.insertId;
}

// ✅ Update method
async update(id: number, shopId: number, data: Partial<Entity>): Promise<boolean> {
  // ✅ Verify ownership first
  const check = await query(
    "SELECT id FROM table WHERE id = ? AND shop_id = ?",
    [id, shopId]
  );
  if (check.length === 0) throw new Error("Not found");

  // Update with shop validation
  await query(
    "UPDATE table SET ... WHERE id = ? AND shop_id = ?",
    [..., id, shopId]
  );
  return true;
}

// ✅ Delete method
async delete(id: number, shopId: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM table WHERE id = ? AND shop_id = ?",
    [id, shopId]  // ⭐ Only delete if belongs to shop
  );
  return result.affectedRows > 0;
}
```

---

## 🎮 Backend Controller Pattern

```typescript
// ✅ Get List
async getList(req: Request, res: Response): Promise<void> {
  const shopId = Number(req.query.shop_id);  // ⭐ Extract
  if (!shopId) { res.status(400).json({ error: "shop_id required" }); return; }

  const data = await Model.getList(shopId);  // ⭐ Pass shop_id
  res.json({ success: true, data });
}

// ✅ Create
async create(req: Request, res: Response): Promise<void> {
  const shopId = Number(req.body.shop_id);  // ⭐ Extract from body
  if (!shopId) { res.status(400).json({ error: "shop_id required" }); return; }

  const id = await Model.create(shopId, req.body);  // ⭐ Pass shop_id
  res.status(201).json({ success: true, data: { id } });
}

// ✅ Update
async update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const shopId = Number(req.body.shop_id);  // ⭐ Extract from body
  if (!shopId) { res.status(400).json({ error: "shop_id required" }); return; }

  await Model.update(id, shopId, req.body);  // ⭐ Pass shop_id
  res.json({ success: true });
}

// ✅ Delete
async delete(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const shopId = Number(req.query.shop_id);  // ⭐ Extract from query
  if (!shopId) { res.status(400).json({ error: "shop_id required" }); return; }

  await Model.delete(id, shopId);  // ⭐ Pass shop_id
  res.json({ success: true });
}
```

---

## 🎨 API Endpoint Pattern

```
GET    /api/endpoint?shop_id=1
GET    /api/endpoint/123?shop_id=1
POST   /api/endpoint (body: { shop_id: 1, ... })
PUT    /api/endpoint/123 (body: { shop_id: 1, ... })
DELETE /api/endpoint/123?shop_id=1
```

---

## 🌍 Frontend Context

```typescript
// ✅ Create
// frontend/src/contexts/ShopContext.tsx
import { createContext, useContext } from 'react';

const ShopContext = createContext<{ shopId: number; shopName: string }>(null);

export const ShopProvider = ({ children }) => {
  const [shopId, setShopId] = useState(1);
  return (
    <ShopContext.Provider value={{ shopId }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);

// ✅ Use in App.tsx
// <ShopProvider>
//   <App />
// </ShopProvider>
```

---

## 🔗 Service Pattern

```typescript
class Service {
  // ✅ List
  async getList(shopId: number): Promise<any[]> {
    const res = await fetch(`/api/endpoint?shop_id=${shopId}`);  // ⭐ Include shop_id
    return res.json().data;
  }

  // ✅ Get by ID
  async getById(id: number, shopId: number): Promise<any> {
    const res = await fetch(`/api/endpoint/${id}?shop_id=${shopId}`);  // ⭐ Include shop_id
    return res.json().data;
  }

  // ✅ Create
  async create(shopId: number, data: any): Promise<number> {
    const res = await fetch(`/api/endpoint`, {
      method: 'POST',
      body: JSON.stringify({ ...data, shop_id: shopId }),  // ⭐ Include shop_id
    });
    return res.json().data.id;
  }

  // ✅ Update
  async update(id: number, shopId: number, data: any): Promise<void> {
    await fetch(`/api/endpoint/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, shop_id: shopId }),  // ⭐ Include shop_id
    });
  }

  // ✅ Delete
  async delete(id: number, shopId: number): Promise<void> {
    await fetch(`/api/endpoint/${id}?shop_id=${shopId}`, {  // ⭐ Include shop_id
      method: 'DELETE',
    });
  }
}
```

---

## 📄 Page Component Pattern

```typescript
// ✅ In every page
import { useShop } from '../contexts/ShopContext';
import Service from '../services/service';

export const Page = () => {
  const { shopId, shopName } = useShop();  // ⭐ Get shop context
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const result = await Service.getList(shopId);  // ⭐ Pass shop_id
      setData(result);
    };
    load();
  }, [shopId]);  // ⭐ Reload when shop changes

  const handleCreate = async (itemData) => {
    await Service.create(shopId, itemData);  // ⭐ Pass shop_id
    // Reload
  };

  const handleUpdate = async (id, itemData) => {
    await Service.update(id, shopId, itemData);  // ⭐ Pass shop_id
    // Reload
  };

  const handleDelete = async (id) => {
    await Service.delete(id, shopId);  // ⭐ Pass shop_id
    // Reload
  };

  return (
    <div>
      <h1>{shopName}</h1>  {/* ⭐ Show shop name */}
      {/* Component JSX */}
    </div>
  );
};
```

---

## 🎯 Implementation Checklist

### Database
- [ ] ALTER products ADD shop_id
- [ ] ALTER categories ADD shop_id
- [ ] ALTER colors ADD shop_id
- [ ] ALTER sizes ADD shop_id
- [ ] ALTER customers ADD shop_id
- [ ] All have unique constraints
- [ ] All have foreign keys
- [ ] All have indexes

### Backend (Copy/Adapt Pattern)
- [ ] ProductModel - add shop_id to all methods
- [ ] CategoryModel - add shop_id to all methods
- [ ] ColorModel - add shop_id to all methods
- [ ] SizeModel - add shop_id to all methods
- [ ] CustomerModel - add shop_id to all methods
- [ ] OrderModel - ensure shop_id is used
- [ ] ProductController - extract & pass shop_id
- [ ] CategoryController - extract & pass shop_id
- [ ] ColorController - extract & pass shop_id
- [ ] SizeController - extract & pass shop_id
- [ ] CustomerController - extract & pass shop_id
- [ ] OrderController - extract & pass shop_id

### Frontend
- [ ] Create ShopContext.tsx
- [ ] Update App.tsx with ShopProvider
- [ ] ProductService - add shop_id to all methods
- [ ] CategoryService - add shop_id to all methods
- [ ] ColorService - add shop_id to all methods
- [ ] SizeService - add shop_id to all methods
- [ ] CustomerService - add shop_id to all methods
- [ ] OrderService - add shop_id to all methods
- [ ] ProductsPage - use useShop, pass shop_id
- [ ] CustomersPage - use useShop, pass shop_id
- [ ] OrdersPage - use useShop, pass shop_id
- [ ] SalesPage - use useShop, pass shop_id
- [ ] InventoryPage - use useShop, pass shop_id
- [ ] Other pages - use useShop, pass shop_id

---

## 🧪 Testing

### Shop 1 Test
```
1. Frontend: shop_id = 1
2. Create product: name="Product A"
3. Create customer: mobile="0771234567"
4. Verify: Product A appears in products list
5. Verify: Customer appears in customers list
```

### Shop 2 Test
```
1. Change shop_id to 2
2. Create product: name="Product B"
3. Create customer: mobile="0771234567" (same mobile, OK!)
4. Verify: Product B appears (not Product A)
5. Verify: Shop 2 customer appears (not Shop 1)
```

### Isolation Test
```
1. Shop 1: 5 products, 10 customers
2. Shop 2: 3 products, 7 customers
3. Switch to Shop 1: See 5 products, 10 customers ✓
4. Switch to Shop 2: See 3 products, 7 customers ✓
5. Switch back Shop 1: Still see 5 products, 10 customers ✓
```

---

## 💾 File References

Quick links to detailed documentation:

- **SQL Snippets**: `HOSTINGER_SQL_UPDATES.md`
- **Model Patterns**: `BACKEND_REDESIGN_MULTI_BRANCH.md`
- **Controller Patterns**: `CONTROLLER_REDESIGN_MULTI_BRANCH.md`
- **Frontend Patterns**: `FRONTEND_REDESIGN_MULTI_BRANCH.md`
- **Full Guide**: `MULTI_BRANCH_IMPLEMENTATION_SUMMARY.md`

---

## ⚡ Quick Copy-Paste

### Database
```sql
ALTER TABLE products ADD COLUMN shop_id INT NOT NULL DEFAULT 1, ADD CONSTRAINT fk_products_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id), ADD INDEX idx_shop_id (shop_id), ADD UNIQUE KEY unique_sku_per_shop (shop_id, sku);

ALTER TABLE categories ADD COLUMN shop_id INT NOT NULL DEFAULT 1, ADD CONSTRAINT fk_categories_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id), ADD INDEX idx_shop_id (shop_id), ADD UNIQUE KEY unique_category_per_shop (shop_id, category_name);

ALTER TABLE colors ADD COLUMN shop_id INT NOT NULL DEFAULT 1, ADD CONSTRAINT fk_colors_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id), ADD INDEX idx_shop_id (shop_id), ADD UNIQUE KEY unique_color_per_shop (shop_id, color_name);

ALTER TABLE sizes ADD COLUMN shop_id INT NOT NULL DEFAULT 1, ADD CONSTRAINT fk_sizes_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id), ADD INDEX idx_shop_id (shop_id), ADD UNIQUE KEY unique_size_per_shop (shop_id, size_name, size_type_id);

ALTER TABLE customers ADD COLUMN shop_id INT NOT NULL DEFAULT 1, ADD CONSTRAINT fk_customers_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id), ADD INDEX idx_shop_id (shop_id), ADD UNIQUE KEY unique_mobile_per_shop (shop_id, mobile);
```

---

## ✅ You're Ready!

You have all patterns and examples. Just follow the checklist and adapt the code patterns to your specific models/controllers/pages.

**Estimated time: 16-19 hours of focused work**

---

