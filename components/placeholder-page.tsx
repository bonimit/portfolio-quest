type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
      <p className="content-note">Placeholder page — content is coming later.</p>
    </section>
  );
}
