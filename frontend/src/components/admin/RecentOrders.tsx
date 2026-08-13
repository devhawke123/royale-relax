import Link from 'next/link'

interface RecentOrder {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
}

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900">Recent Orders</h2>
        <Link href="/admin/orders" className="text-sm font-medium text-[#b87333] hover:underline">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-stone-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`py-3 ${index > 0 ? 'border-t border-stone-100' : 'pt-0'}`}
            >
              <p className="text-sm font-medium text-stone-900">#{order.orderNumber}</p>
              <p className="text-sm text-stone-500">
                {order.firstName} {order.lastName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
