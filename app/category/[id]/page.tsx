import FiltersSidebar from "@/components/Filters/FiltersSidebar";

type Product = {
  id: number;
  slug: string;
  title: string;
  price: number;
  img1?: string;
  category?: {
    name: string;
  };
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ UNWRAP params
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?categoryId=${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Category</h1>
        <p className="text-gray-500">Failed to load products.</p>
      </div>
    );
  }

  const data = await res.json();

  const products: Product[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
    ? data.products
    : [];

  const categoryName =
    products.length > 0 ? products[0]?.category?.name : "Category";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        {categoryName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3">
          <FiltersSidebar categoryId={id} />
        </div>

        <div className="md:col-span-9">
          {products.length === 0 && (
            <p className="text-gray-600">No products found.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <a
                key={p.id}
                href={`/products/${p.slug}`}
                className="border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
              >
                <div className="w-full h-64 overflow-hidden rounded-t-xl">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${p.img1}`}
                    alt={p.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-brandPink font-bold mt-2 text-lg">
                    ₹{p.price}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
