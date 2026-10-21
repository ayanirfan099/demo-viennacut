
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-bold tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-4 max-w-2xl text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
