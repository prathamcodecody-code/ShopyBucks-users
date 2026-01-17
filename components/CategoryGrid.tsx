"use client";

export default function CategoryGrid() {
  const categories = [
    { title: "Women", image: "/categories/women.jpg" },
    { title: "Men", image: "/categories/men.jpg" },
    { title: "Kids", image: "/categories/kids.jpg" },
    { title: "Sports", image: "/categories/sports.png" },
    { title: "Beauty", image: "/categories/beauty.png" },
    { title: "Electronics", image: "/categories/electronics.png" },
  ];

  return (
    <section className="mt-20 mb-20">
      <h2 className="text-3xl font-bold text-center text-brandBlack mb-10">
        Shop By Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {categories.map((c) => (
          <div
            key={c.title}
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
          >
            {/* IMAGE */}
            <div className="h-52 overflow-hidden">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />

            {/* TEXT */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="text-sm opacity-90">Explore →</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
