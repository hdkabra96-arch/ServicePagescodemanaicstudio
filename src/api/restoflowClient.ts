import type {
  CustomerDetailRecord,
  CustomerFeedbackRecord,
  CustomerRecord,
  DiningTable,
  IngredientRecord,
  InventorySummaryStats,
  InventoryTransactionRecord,
  MenuAddon,
  MenuCategory,
  MenuItem,
  MenuVariant,
  OrderRecord,
  PurchaseOrderRecord,
  RecipeRecord,
  RestaurantSettings,
  RestoFlowDashboardData,
  RestoFlowDemoAccountInfo,
  RestoFlowNotification,
  RestoFlowReportData,
  RestoFlowRole,
  RestoFlowRolePermissions,
  RestoFlowUser,
  StaffAttendanceRecord,
  StaffShiftRecord,
  SupplierRecord
} from '../types/restoflow';

let inMemoryToken: string | null = null;

export function setRestoFlowToken(token: string | null): void {
  inMemoryToken = token;
}

export function getRestoFlowToken(): string | null {
  return inMemoryToken;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface KdsTicketRecord extends OrderRecord {
  elapsedMins: number;
  urgency: 'normal' | 'warning' | 'critical';
}

async function restoFetch<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (inMemoryToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${inMemoryToken}`;
  }

  const res = await fetch(`/api/restoflow${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const payload = await res.json().catch(() => ({
    success: false,
    message: `Unexpected server response (${res.status})`
  }));

  if (!res.ok || !payload.success) {
    throw new Error(payload.message || `Request failed (${res.status})`);
  }

  return payload as ApiEnvelope<T>;
}

export const restoFlowApi = {
  // Auth & Demo
  getDemoAccounts() {
    return restoFetch<{
      restaurantName: string;
      tagline: string;
      demoMode: boolean;
      accounts: RestoFlowDemoAccountInfo[];
    }>('/auth/demo-accounts');
  },

  async login(email: string, password: string) {
    const res = await restoFetch<{
      token: string;
      expiresAt: string;
      user: RestoFlowUser;
      permissions: RestoFlowRolePermissions;
      restaurant: RestaurantSettings;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setRestoFlowToken(res.data.token);
    return res;
  },

  async logout() {
    try {
      await restoFetch<null>('/auth/logout', { method: 'POST', body: '{}' });
    } finally {
      setRestoFlowToken(null);
    }
  },

  getMe() {
    return restoFetch<{
      user: RestoFlowUser;
      permissions: RestoFlowRolePermissions;
      restaurant: RestaurantSettings;
      unreadNotifications: number;
    }>('/auth/me');
  },

  async resetDemoData() {
    const res = await restoFetch<{
      token: string | null;
      user: RestoFlowUser;
      restaurant: RestaurantSettings;
      restoredCounts: {
        menuItems: number;
        tables: number;
        orders: number;
      };
    }>('/demo/reset', {
      method: 'POST',
      body: '{}'
    });
    if (res.data.token) {
      setRestoFlowToken(res.data.token);
    }
    return res;
  },

  // Dashboard, Notifications & Settings
  getDashboard() {
    return restoFetch<RestoFlowDashboardData>('/dashboard');
  },

  getNotifications() {
    return restoFetch<RestoFlowNotification[]>('/notifications');
  },

  markAllNotificationsRead() {
    return restoFetch<null>('/notifications/read-all', {
      method: 'POST',
      body: '{}'
    });
  },

  getSettings() {
    return restoFetch<RestaurantSettings>('/settings');
  },

  updateSettings(updates: Partial<RestaurantSettings>) {
    return restoFetch<RestaurantSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Menu Management
  getMenuCategories() {
    return restoFetch<MenuCategory[]>('/menu/categories');
  },

  createMenuCategory(payload: { name: string; description?: string; sortOrder?: number }) {
    return restoFetch<MenuCategory>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteMenuCategory(id: string) {
    return restoFetch<null>(`/menu/categories/${id}`, { method: 'DELETE' });
  },

  getMenuItems(params?: { search?: string; categoryId?: string; dietaryType?: string; availableOnly?: boolean }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.categoryId && params.categoryId !== 'all') q.set('categoryId', params.categoryId);
    if (params?.dietaryType && params.dietaryType !== 'all') q.set('dietaryType', params.dietaryType);
    if (params?.availableOnly) q.set('availableOnly', 'true');
    const qs = q.toString() ? `?${q.toString()}` : '';
    return restoFetch<MenuItem[]>(`/menu/items${qs}`);
  },

  createMenuItem(payload: {
    categoryId: string;
    sku?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    basePrice: number;
    dietaryType: 'veg' | 'non_veg' | 'egg' | 'vegan';
    prepTimeMins: number;
    kitchenStation: 'hot_kitchen' | 'tandoor' | 'bar' | 'pastry' | 'cold_station';
    isAvailable?: boolean;
    isFeatured?: boolean;
    variants?: MenuVariant[];
    addons?: MenuAddon[];
  }) {
    return restoFetch<MenuItem>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateMenuItem(id: string, payload: Partial<MenuItem>) {
    return restoFetch<MenuItem>(`/menu/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  toggleMenuItemAvailability(id: string, isAvailable?: boolean) {
    return restoFetch<MenuItem>(`/menu/items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify(isAvailable !== undefined ? { isAvailable } : {})
    });
  },

  deleteMenuItem(id: string) {
    return restoFetch<null>(`/menu/items/${id}`, { method: 'DELETE' });
  },

  // Dining Tables
  getTables() {
    return restoFetch<DiningTable[]>('/tables');
  },

  createTable(payload: { tableNumber: string; name: string; section: string; capacity: number }) {
    return restoFetch<DiningTable>('/tables', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateTable(
    id: string,
    payload: Partial<Pick<DiningTable, 'name' | 'section' | 'capacity' | 'status'>>
  ) {
    return restoFetch<DiningTable>(`/tables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  deleteTable(id: string) {
    return restoFetch<null>(`/tables/${id}`, { method: 'DELETE' });
  },

  reserveTable(id: string, payload: { guestName: string; phone: string; reservedAt?: string }) {
    return restoFetch<DiningTable>(`/tables/${id}/reserve`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  transferTable(fromTableId: string, toTableId: string) {
    return restoFetch<{ fromTable: DiningTable; toTable: DiningTable }>(
      `/tables/${fromTableId}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify({ toTableId })
      }
    );
  },

  mergeTables(primaryTableId: string, secondaryTableIds: string[]) {
    return restoFetch<DiningTable[]>('/tables/merge', {
      method: 'POST',
      body: JSON.stringify({ primaryTableId, secondaryTableIds })
    });
  },

  unmergeTable(tableId: string) {
    return restoFetch<DiningTable[]>(`/tables/${tableId}/unmerge`, {
      method: 'POST',
      body: '{}'
    });
  },

  // POS & Orders
  getOrders(params?: { status?: string; orderType?: string; paymentStatus?: string; search?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.orderType && params.orderType !== 'all') q.set('orderType', params.orderType);
    if (params?.paymentStatus && params.paymentStatus !== 'all') q.set('paymentStatus', params.paymentStatus);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return restoFetch<OrderRecord[]>(`/orders${qs}`);
  },

  getOrder(id: string) {
    return restoFetch<OrderRecord>(`/orders/${id}`);
  },

  createOrder(payload: {
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    tableId?: string | null;
    customerId?: string | null;
    discountType?: 'none' | 'percent' | 'flat';
    discountValue?: number;
    deliveryAddress?: string;
    kitchenNotes?: string;
    hold?: boolean;
    items: {
      menuItemId: string;
      quantity: number;
      variantName?: string;
      addonNames?: string[];
      specialInstructions?: string;
    }[];
    payments?: {
      paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
      amount: number;
      referenceNumber?: string;
    }[];
  }) {
    return restoFetch<OrderRecord>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  holdOrder(id: string) {
    return restoFetch<OrderRecord>(`/orders/${id}/hold`, { method: 'POST', body: '{}' });
  },

  resumeOrder(id: string) {
    return restoFetch<OrderRecord>(`/orders/${id}/resume`, { method: 'POST', body: '{}' });
  },

  recordPayments(
    orderId: string,
    payments: {
      paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
      amount: number;
      referenceNumber?: string;
    }[]
  ) {
    return restoFetch<OrderRecord>(`/orders/${orderId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ payments })
    });
  },

  cancelOrder(orderId: string, reason: string) {
    return restoFetch<OrderRecord>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  getOrderReceipt(orderId: string) {
    return restoFetch<{
      restaurant: RestaurantSettings;
      order: OrderRecord;
      generatedAt: string;
    }>(`/orders/${orderId}/receipt`);
  },

  // Kitchen Display System (KDS)
  getKdsQueue(station = 'all') {
    const qs = station && station !== 'all' ? `?station=${encodeURIComponent(station)}` : '';
    return restoFetch<KdsTicketRecord[]>(`/kds/queue${qs}`);
  },

  updateKdsOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'ready' | 'served') {
    return restoFetch<OrderRecord>(`/kds/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  updateKdsItemStatus(itemId: string, status: 'queued' | 'preparing' | 'ready' | 'served') {
    return restoFetch<OrderRecord>(`/kds/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Inventory & Procurement
  getInventorySummary() {
    return restoFetch<InventorySummaryStats>('/inventory/summary');
  },

  getIngredients(params?: { search?: string; category?: string; lowStockOnly?: boolean }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category && params.category !== 'all') q.set('category', params.category);
    if (params?.lowStockOnly) q.set('lowStockOnly', 'true');
    const qs = q.toString() ? `?${q.toString()}` : '';
    return restoFetch<IngredientRecord[]>(`/inventory/ingredients${qs}`);
  },

  createIngredient(payload: {
    sku?: string;
    name: string;
    category: string;
    unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
    currentStock: number;
    minStockLevel: number;
    unitCost: number;
    defaultSupplierId?: string | null;
  }) {
    return restoFetch<IngredientRecord>('/inventory/ingredients', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateIngredient(
    id: string,
    payload: Partial<{
      name: string;
      category: string;
      unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
      minStockLevel: number;
      unitCost: number;
      defaultSupplierId: string | null;
    }>
  ) {
    return restoFetch<IngredientRecord>(`/inventory/ingredients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  deleteIngredient(id: string) {
    return restoFetch<null>(`/inventory/ingredients/${id}`, { method: 'DELETE' });
  },

  getInventoryTransactions(params?: { ingredientId?: string; txType?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.ingredientId && params.ingredientId !== 'all') q.set('ingredientId', params.ingredientId);
    if (params?.txType && params.txType !== 'all') q.set('txType', params.txType);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return restoFetch<InventoryTransactionRecord[]>(`/inventory/transactions${qs}`);
  },

  recordStockMovement(payload: {
    ingredientId: string;
    txType: 'stock_in' | 'stock_out' | 'wastage' | 'adjustment';
    quantity: number;
    unitCost?: number;
    supplierId?: string | null;
    referenceNo?: string;
    reason?: string;
  }) {
    return restoFetch<{ ingredient: IngredientRecord; transaction: InventoryTransactionRecord }>(
      '/inventory/transactions',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  getSuppliers() {
    return restoFetch<SupplierRecord[]>('/inventory/suppliers');
  },

  createSupplier(payload: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    category?: string;
    paymentTerms?: string;
  }) {
    return restoFetch<SupplierRecord>('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateSupplier(
    id: string,
    payload: Partial<{
      name: string;
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
      category: string;
      paymentTerms: string;
      isActive: boolean;
    }>
  ) {
    return restoFetch<SupplierRecord>(`/inventory/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  deleteSupplier(id: string) {
    return restoFetch<null>(`/inventory/suppliers/${id}`, { method: 'DELETE' });
  },

  getPurchaseOrders() {
    return restoFetch<PurchaseOrderRecord[]>('/inventory/purchase-orders');
  },

  createPurchaseOrder(payload: {
    supplierId: string;
    status?: 'draft' | 'ordered';
    notes?: string;
    items: { ingredientId: string; quantity: number; unitCost: number }[];
  }) {
    return restoFetch<PurchaseOrderRecord>('/inventory/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updatePurchaseOrderStatus(id: string, status: 'ordered' | 'received' | 'cancelled') {
    return restoFetch<PurchaseOrderRecord>(`/inventory/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Recipe Management & Food Costing
  getRecipes(search?: string) {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return restoFetch<{
      recipes: RecipeRecord[];
      unmappedMenuItems: {
        id: string;
        name: string;
        categoryName: string;
        basePrice: number;
        dietaryType: string;
      }[];
      analytics: {
        mappedCount: number;
        unmappedCount: number;
        avgFoodCostPct: number;
        highCostCount: number;
        avgGrossMargin: number;
      };
    }>(`/recipes${qs}`);
  },

  upsertRecipe(payload: {
    menuItemId: string;
    yieldServings: number;
    prepNotes?: string;
    ingredients: { ingredientId: string; quantityRequired: number }[];
  }) {
    return restoFetch<RecipeRecord>('/recipes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteRecipe(id: string) {
    return restoFetch<null>(`/recipes/${id}`, { method: 'DELETE' });
  },

  // Customers & Loyalty
  getCustomers(search?: string) {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return restoFetch<CustomerRecord[]>(`/customers${qs}`);
  },

  getCustomerDetail(id: string) {
    return restoFetch<CustomerDetailRecord>(`/customers/${id}`);
  },

  createCustomer(payload: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }) {
    return restoFetch<CustomerRecord>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateCustomer(
    id: string,
    payload: Partial<{ fullName: string; phone: string; email: string; address: string; notes: string }>
  ) {
    return restoFetch<CustomerRecord>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  adjustCustomerLoyalty(id: string, payload: { action: 'award' | 'redeem'; points: number; note?: string }) {
    return restoFetch<CustomerRecord>(`/customers/${id}/loyalty`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  addCustomerFeedback(id: string, payload: { orderId?: string | null; rating: number; comment: string }) {
    return restoFetch<CustomerFeedbackRecord>(`/customers/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Staff, Shifts & Attendance
  getStaff() {
    return restoFetch<RestoFlowUser[]>('/staff');
  },

  createStaff(payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: RestoFlowRole;
    station?: string;
  }) {
    return restoFetch<RestoFlowUser>('/staff', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateStaff(
    id: string,
    payload: Partial<{
      fullName: string;
      phone: string;
      role: RestoFlowRole;
      station: string;
      isActive: boolean;
    }>
  ) {
    return restoFetch<RestoFlowUser>(`/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  getStaffShifts(date?: string) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return restoFetch<StaffShiftRecord[]>(`/staff/shifts${qs}`);
  },

  createStaffShift(payload: {
    userId: string;
    shiftDate: string;
    shiftName: 'morning' | 'afternoon' | 'evening' | 'split';
    startTime: string;
    endTime: string;
    station?: string;
    notes?: string;
  }) {
    return restoFetch<StaffShiftRecord>('/staff/shifts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteStaffShift(id: string) {
    return restoFetch<null>(`/staff/shifts/${id}`, { method: 'DELETE' });
  },

  getStaffAttendance(date?: string) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return restoFetch<StaffAttendanceRecord[]>(`/staff/attendance${qs}`);
  },

  upsertStaffAttendance(payload: {
    userId: string;
    attendanceDate: string;
    status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
    clockIn?: string | null;
    clockOut?: string | null;
    notes?: string;
  }) {
    return restoFetch<StaffAttendanceRecord>('/staff/attendance', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  clockAttendance(action: 'clock_in' | 'clock_out') {
    return restoFetch<StaffAttendanceRecord>('/staff/attendance/clock', {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  // Reports & Analytics
  getReports(period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    return restoFetch<RestoFlowReportData>(`/reports?period=${period}`);
  }
};
