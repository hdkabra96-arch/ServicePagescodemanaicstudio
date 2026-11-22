export type RestoFlowRole =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'waiter'
  | 'kitchen'
  | 'inventory_manager';

export interface RestoFlowUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: RestoFlowRole;
  station: string;
  isActive: boolean;
  isDemo: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface RestoFlowRolePermissions {
  canViewExecutiveDashboard: boolean;
  canUsePos: boolean;
  canApplyDiscounts: boolean;
  canCancelOrders: boolean;
  canManageMenu: boolean;
  canToggleMenuAvailability: boolean;
  canManageTables: boolean;
  canOperateKds: boolean;
  canManageInventory: boolean;
  canLogWastage: boolean;
  canManageRecipes: boolean;
  canManageCustomers: boolean;
  canManageStaff: boolean;
  canViewFullReports: boolean;
  canViewInventoryReports: boolean;
  canManageSettings: boolean;
  canResetDemo: boolean;
}

export interface RestoFlowDemoAccountInfo {
  role: RestoFlowRole;
  label: string;
  fullName: string;
  email: string;
  demoPassword: string;
  workspaceTitle: string;
  highlights: string;
}

export interface RestaurantSettings {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  gstin: string;
  currencyCode: string;
  currencySymbol: string;
  taxLabel: string;
  taxRatePct: number;
  serviceChargePct: number;
  receiptHeader: string;
  receiptFooter: string;
  loyaltyPointsPer100: number;
  demoMode: boolean;
  updatedAt: string;
}

export interface MenuVariant {
  name: string;
  priceDelta: number;
}

export interface MenuAddon {
  name: string;
  price: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isDemo: boolean;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  sku: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  dietaryType: 'veg' | 'non_veg' | 'egg' | 'vegan';
  prepTimeMins: number;
  kitchenStation: 'hot_kitchen' | 'tandoor' | 'bar' | 'pastry' | 'cold_station';
  isAvailable: boolean;
  isFeatured: boolean;
  variants: MenuVariant[];
  addons: MenuAddon[];
  isDemo: boolean;
  updatedAt: string;
}

export interface DiningTable {
  id: string;
  tableNumber: string;
  name: string;
  section: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  activeOrderId: string | null;
  activeOrderNumber?: string | null;
  activeOrderTotal?: number | null;
  mergedIntoTableId: string | null;
  mergedIntoTableNumber?: string | null;
  reservedForName: string;
  reservedPhone: string;
  reservedAt: string | null;
  isDemo: boolean;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemNameSnapshot: string;
  variantName: string;
  addons: MenuAddon[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions: string;
  kitchenStation: string;
  kitchenStatus: 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled';
  startedAt: string | null;
  readyAt: string | null;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
  amount: number;
  referenceNumber: string;
  collectedBy: string;
  collectedByName?: string;
  paidAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableId: string | null;
  tableNumber?: string | null;
  customerId: string | null;
  customerName?: string | null;
  waiterId: string | null;
  waiterName?: string | null;
  cashierId: string | null;
  cashierName?: string | null;
  status: 'held' | 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  subtotal: number;
  discountType: 'none' | 'percent' | 'flat';
  discountValue: number;
  discountAmount: number;
  taxRatePct: number;
  taxAmount: number;
  serviceChargeAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  deliveryAddress: string;
  kitchenNotes: string;
  cancelReason: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  paymentTerms: string;
  isActive: boolean;
  isDemo: boolean;
}

export interface IngredientRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
  currentStock: number;
  minStockLevel: number;
  unitCost: number;
  stockValue: number;
  isLowStock: boolean;
  defaultSupplierId: string | null;
  supplierName?: string | null;
  isDemo: boolean;
  updatedAt: string;
}

export interface InventoryTransactionRecord {
  id: string;
  ingredientId: string;
  ingredientName?: string;
  ingredientUnit?: string;
  txType: 'stock_in' | 'stock_out' | 'wastage' | 'adjustment' | 'recipe_deduction';
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierId: string | null;
  supplierName?: string | null;
  referenceNo: string;
  reason: string;
  createdBy: string;
  createdByName?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface PurchaseOrderItemRecord {
  id: string;
  purchaseOrderId: string;
  ingredientId: string;
  ingredientName: string;
  ingredientUnit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  totalAmount: number;
  orderedAt: string;
  receivedAt: string | null;
  notes: string;
  createdBy: string;
  createdByName?: string;
  isDemo: boolean;
  createdAt: string;
  items: PurchaseOrderItemRecord[];
}

export interface InventorySummaryStats {
  totalIngredients: number;
  lowStockCount: number;
  totalStockValue: number;
  activeSuppliers: number;
  openPoCount: number;
  wastageCost7d: number;
}

export interface RecipeRecord {
  id: string;
  menuItemId: string;
  menuItemName: string;
  categoryName: string;
  sellingPrice: number;
  yieldServings: number;
  prepNotes: string;
  totalRecipeCost: number;
  costPerServing: number;
  foodCostPct: number;
  grossMargin: number;
  isDemo: boolean;
  updatedAt: string;
  ingredients: {
    id: string;
    ingredientId: string;
    ingredientName: string;
    unit: string;
    quantityRequired: number;
    unitCost: number;
    lineCost: number;
  }[];
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  avgRating?: number | null;
  notes: string;
  isDemo: boolean;
  createdAt: string;
}

export interface CustomerFeedbackRecord {
  id: string;
  customerId: string;
  orderId: string | null;
  rating: number;
  comment: string;
  isDemo: boolean;
  createdAt: string;
}

export interface CustomerDetailRecord extends CustomerRecord {
  orders: {
    id: string;
    orderNumber: string;
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    status: string;
    paymentStatus: string;
    grandTotal: number;
    createdAt: string;
  }[];
  feedback: CustomerFeedbackRecord[];
}

export interface StaffShiftRecord {
  id: string;
  userId: string;
  staffName: string;
  staffRole: RestoFlowRole;
  shiftDate: string;
  shiftName: 'morning' | 'afternoon' | 'evening' | 'split';
  startTime: string;
  endTime: string;
  station: string;
  notes: string;
  isDemo: boolean;
  createdAt: string;
}

export interface StaffAttendanceRecord {
  id: string;
  userId: string;
  staffName: string;
  staffRole: RestoFlowRole;
  attendanceDate: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  notes: string;
  isDemo: boolean;
}

export interface RestoFlowReportData {
  period: 'daily' | 'weekly' | 'monthly';
  periodLabel: string;
  generatedAt: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
    totalTaxCollected: number;
    totalServiceCharge: number;
    totalDiscounts: number;
    totalStockValuation: number;
    lowStockCount: number;
    wastageCost: number;
  };
  salesTimeline: {
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }[];
  productPerformance: {
    menuItemId: string;
    name: string;
    categoryName: string;
    quantitySold: number;
    revenue: number;
    unitCost: number;
    estGrossProfit: number;
  }[];
  paymentBreakdown: {
    paymentMethod: string;
    count: number;
    amount: number;
    sharePct: number;
  }[];
  channelBreakdown: {
    orderType: string;
    count: number;
    revenue: number;
  }[];
  inventoryReport: {
    id: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStockLevel: number;
    unitCost: number;
    stockValue: number;
    status: 'low' | 'healthy';
  }[];
}

export interface RestoFlowNotification {
  id: string;
  targetRole: string;
  targetUserId: string | null;
  type: 'order' | 'kitchen' | 'inventory' | 'billing' | 'system';
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface RestoFlowDashboardData {
  kpis: {
    todaySales: number;
    todayOrders: number;
    pendingOrders: number;
    completedOrders: number;
    heldOrders: number;
    occupiedTables: number;
    reservedTables: number;
    totalTables: number;
    tableOccupancyPct: number;
    lowStockCount: number;
    kitchenActiveCount: number;
    averageOrderValue: number;
    avgFoodCostPct: number;
  };
  revenueSeries: {
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }[];
  popularProducts: {
    menuItemId: string;
    name: string;
    categoryName: string;
    quantitySold: number;
    revenue: number;
  }[];
  orderTypeBreakdown: {
    orderType: string;
    count: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    orderType: string;
    tableNumber: string | null;
    customerName: string;
    status: string;
    paymentStatus: string;
    grandTotal: number;
    isDemo: boolean;
    createdAt: string;
  }[];
  lowStockAlerts: {
    id: string;
    name: string;
    currentStock: number;
    minStockLevel: number;
    unit: string;
  }[];
}
