type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-lg">{description}</p>
      <p className="mt-6">Placeholder page — content is coming later.</p>
    </>
  );
}
