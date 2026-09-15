export function PageHero({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="bg-[var(--background-dark)] py-16 text-white">
      <div className="container-lme">
        <h1 className="max-w-4xl text-4xl font-black sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">{copy}</p>
      </div>
    </section>
  );
}
