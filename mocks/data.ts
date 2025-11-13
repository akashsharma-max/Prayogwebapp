import { 
    KycDetails,
    WidgetData,
    ChartData,
    TopSubTenant,
    RecentUser,
    RateCard, 
    RateCardStatus,
    OrderEntity,
    OrderStatus,
    RecentActivity,
    ActivityStatus,
    RevenueData
} from '../types';

// --- NEW DASHBOARD MOCK DATA ---

export const kycData: KycDetails = {
    status: 'Pending',
    documentType: 'Aadhar Card',
    documentNumber: '**** **** 1234'
};

export const widgetsData: WidgetData[] = [
    {
        title: 'Total Orders',
        total: 71400,
        percent: 2.6,
        chartData: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
        color: 'primary',
    },
    {
        title: 'Total Active Sub-Tenants',
        total: 1250,
        percent: -0.2,
        chartData: [45, 52, 38, 24, 33, 24, 35, 52, 38, 24],
        color: 'info',
    },
    {
        title: 'Total Revenue',
        total: 48765,
        percent: 4.8,
        chartData: [35, 41, 62, 42, 13, 18, 29, 37, 38, 39],
        color: 'error',
        isCurrency: true
    }
];

const currentYear = new Date().getFullYear();
export const ordersOverviewData: ChartData = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
        {
            name: String(currentYear - 2),
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 120, 130, 110],
        },
        {
            name: String(currentYear - 1),
            data: [20, 51, 45, 61, 59, 72, 79, 101, 158, 130, 140, 120],
        },
        {
            name: String(currentYear),
            data: [30, 61, 55, 71, 69, 82, 89, 111, 168, 140, 150, 130],
        },
    ],
};

export const topSubTenantsData: TopSubTenant[] = [
    { id: '1', name: 'Global Tech Inc.', owner: 'John Smith', revenue: 120500, profit: 0.15, avatarUrl: 'https://i.pravatar.cc/150?u=tenant1' },
    { id: '2', name: 'Innovate Solutions', owner: 'Jane Doe', revenue: 98700, profit: 0.22, avatarUrl: 'https://i.pravatar.cc/150?u=tenant2' },
    { id: '3', 'name': 'Quantum Logistics', owner: 'Peter Jones', revenue: 85300, profit: -0.05, avatarUrl: 'https://i.pravatar.cc/150?u=tenant3' },
    { id: '4', name: 'Stellar Services', owner: 'Mary Johnson', revenue: 76400, profit: 0.18, avatarUrl: 'https://i.pravatar.cc/150?u=tenant4' },
    { id: '5', name: 'Apex Enterprises', owner: 'David Williams', revenue: 65100, profit: 0.12, avatarUrl: 'https://i.pravatar.cc/150?u=tenant5' },
];

export const recentUsersData: RecentUser[] = [
    { id: '1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=user1', onboardedAt: '2 hours ago' },
    { id: '2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=user2', onboardedAt: '5 hours ago' },
    { id: '3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=user3', onboardedAt: '1 day ago' },
    { id: '4', name: 'Diana Miller', avatarUrl: 'https://i.pravatar.cc/150?u=user4', onboardedAt: '2 days ago' },
    { id: '5', name: 'Ethan Davis', avatarUrl: 'https://i.pravatar.cc/150?u=user5', onboardedAt: '3 days ago' },
];

// --- ORDER HISTORY MOCK DATA ---
const statuses: OrderStatus[] = ['CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'PENDING', 'PROCESSING'];
const paymentModes = ['Prepaid', 'COD'];
const deliveryPromises = ['Standard', 'Express', 'Same Day'];
const parcelCategories: ('DOMESTIC' | 'INTERNATIONAL')[] = ['DOMESTIC', 'INTERNATIONAL'];

const generateRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const orderHistoryData: OrderEntity[] = Array.from({ length: 250 }, (_, i) => {
    const id = `ORD-${1000 + i}`;
    const status = statuses[i % statuses.length];
    return {
        id: id,
        orderId: `OD${Date.now() - i * 100000}`,
        awbNumber: `AWB${Math.floor(100000000 + Math.random() * 900000000)}`,
        destinationPincode: `${Math.floor(100000 + Math.random() * 900000)}`,
        deliveryPromise: deliveryPromises[i % deliveryPromises.length],
        weight: `${(Math.random() * 5).toFixed(2)}kg`,
        lbh: `${Math.floor(10 + Math.random() * 20)}x${Math.floor(10 + Math.random() * 20)}x${Math.floor(10 + Math.random() * 20)} cm`,
        bookingDate: generateRandomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        paymentMode: paymentModes[i % paymentModes.length],
        status: status,
        parcelCategory: parcelCategories[i % parcelCategories.length],
    };
});

// Simulated API service for fetching orders
export const fetchOrdersAPI = async (options: {
    page: number;
    pageSize: number;
    sortField?: keyof OrderEntity;
    sortDirection?: 'asc' | 'desc';
    searchQuery?: string;
}): Promise<{ orders: OrderEntity[]; total: number }> => {
    const { page, pageSize, sortField, sortDirection, searchQuery } = options;

    let filteredData = [...orderHistoryData];

    // Simulate search
    if (searchQuery) {
        filteredData = filteredData.filter(order => 
            order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Simulate sorting
    if (sortField && sortDirection) {
        filteredData.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    const total = filteredData.length;
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredData.slice(start, end);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    return { orders: paginatedData, total };
};


// --- EXISTING MOCK DATA (for other pages) ---
export const rateCards: RateCard[] = [
    { id: 'rc1', name: 'Standard Tier', region: 'North America', service: 'Consulting', price: 150.00, status: RateCardStatus.Active },
    { id: 'rc2', name: 'Premium Tier', region: 'North America', service: 'Consulting', price: 300.00, status: RateCardStatus.Active },
    { id: 'rc3', name: 'Basic Support', region: 'Europe', service: 'Support', price: 50.00, status: RateCardStatus.Active },
    { id: 'rc4', name: 'Enterprise Support', region: 'Europe', service: 'Support', price: 250.00, status: RateCardStatus.Draft },
    { id: 'rc5', name: 'Standard Implementation', region: 'APAC', service: 'Implementation', price: 5000.00, status: RateCardStatus.Active },
    { id: 'rc6', name: 'Legacy Plan', region: 'Global', service: 'All', price: 100.00, status: RateCardStatus.Inactive },
    { id: 'rc7', name: 'Custom Project Rate', region: 'LATAM', service: 'Project Work', price: 120.50, status: RateCardStatus.Active },
];

// Fix: Add mock data for deprecated components to resolve import errors.
export const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
    { month: 'Jul', revenue: 7000 },
];

export const recentActivities: RecentActivity[] = [
    {
      id: 'ra1',
      user: { name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?u=ra_user1' },
      action: 'Created a new order #12345',
      timestamp: '5m ago',
      status: ActivityStatus.Completed,
    },
    {
      id: 'ra2',
      user: { name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=ra_user2' },
      action: 'Updated sub-tenant profile',
      timestamp: '1h ago',
      status: ActivityStatus.Completed,
    },
    {
      id: 'ra3',
      user: { name: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=ra_admin' },
      action: 'Payment of $250 failed',
      timestamp: '2h ago',
      status: ActivityStatus.Failed,
    },
    {
      id: 'ra4',
      user: { name: 'Peter Jones', avatarUrl: 'https://i.pravatar.cc/150?u=ra_user3' },
      action: 'Submitted KYC documents',
      timestamp: '1d ago',
      status: ActivityStatus.Pending,
    },
];