'use client';

export default function AdminDashboard() {
  // Sample Stats Data
  const stats = [
    {
      title: 'Total Orders',
      value: '156',
      change: '+12%',
      icon: 'fa-shopping-bag',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Revenue',
      value: 'Rs. 45,320',
      change: '+8%',
      icon: 'fa-dollar-sign',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Products',
      value: '89',
      change: '+5',
      icon: 'fa-box',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Customers',
      value: '234',
      change: '+23',
      icon: 'fa-users',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Welcome back! Here's your store performance.</p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <i className={`fa-solid ${stat.icon} ${stat.textColor} text-xl`}></i>
              </div>
              <span className="text-green-600 text-xs md:text-sm font-semibold">{stat.change}</span>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Sales Chart */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 border-b pb-3">Sales Overview</h2>
          <div className="h-[250px] md:h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <i className="fa-solid fa-chart-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-sm text-gray-400">Chart placeholder</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 border-b pb-3">Revenue Distribution</h2>
          <div className="h-[250px] md:h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <i className="fa-solid fa-chart-pie text-4xl text-gray-300 mb-2"></i>
              <p className="text-sm text-gray-400">Chart placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 pb-3 border-b gap-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Orders</h2>
          <a 
            href="/admin/orders"
            className="text-[#10b981] hover:text-[#059669] text-xs md:text-sm font-semibold transition-colors"
          >
            View All →
          </a>
        </div>

        {/* Table with horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <div className="min-w-full md:min-w-0">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <i className="fa-solid fa-inbox text-3xl md:text-4xl mb-2 md:mb-3"></i>
                      <p className="text-sm md:text-base">No orders yet. Create your first order!</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <a
            href="/admin/products/add"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span className="sm:inline">Add New Product</span>
          </a>
        </div>
      </div>
    </div>
  );
}