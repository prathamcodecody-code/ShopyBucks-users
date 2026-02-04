"use client";

type TextSection = {
  id: number;
  title?: string;
  subtitle?: string;
};

export default function TextBlockSection({
  section,
}: {
  section: TextSection;
}) {
  if (!section.title && !section.subtitle) return null;

  return (
    /* OUTER WRAPPER: Aligns with the max-w-7xl used in your carousel and grids */
    <section className="bg-genz-bg py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* BENTO CARD: Using your white card token and genz-border */}
        <div className="bg-white border border-genz-border rounded-genz p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          
          {/* OPTIONAL ACCENT: Minimal Gen Z detail */}
          <div className="w-12 h-1.5 bg-genz-accent rounded-full mb-8" />

          {section.title && (
            <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase leading-tight mb-6">
              {section.title}
            </h2>
          )}

          {section.subtitle && (
            <div className="relative">
              {/* Vertical line accent for long text blocks */}
              <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 bg-genz-softAccent rounded-full hidden md:block" />
              
              <p className="text-genz-muted text-sm md:text-lg leading-relaxed whitespace-pre-line font-medium tracking-tight">
                {section.subtitle}
              </p>
            </div>
          )}

          {/* INTERACTION DETAIL: Subtle "End of Section" indicator */}
          <div className="mt-10 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-genz-accent/20" />
            <div className="w-2 h-2 rounded-full bg-genz-accent/40" />
            <div className="w-2 h-2 rounded-full bg-genz-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}