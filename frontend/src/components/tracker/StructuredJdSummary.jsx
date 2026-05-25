function Section({ title, children }) {
  if (!children) return null
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">{title}</h3>
      {children}
    </section>
  )
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-charcoal/80">
          <span className="text-sage">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function StructuredJdSummary({ jdSummary }) {
  if (!jdSummary) return null

  const hasContent =
    jdSummary.summary ||
    jdSummary.experienceLevel ||
    jdSummary.location ||
    jdSummary.compensation ||
    jdSummary.responsibilities?.length ||
    jdSummary.requirements?.length ||
    jdSummary.skills?.length ||
    jdSummary.benefits?.length

  if (!hasContent) return null

  return (
    <div className="space-y-5 rounded-2xl border border-sage/20 bg-sage/5 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-sage">AI structured summary</p>

      {jdSummary.summary ? (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-charcoal/80">{jdSummary.summary}</p>
        </Section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {jdSummary.experienceLevel ? (
          <Section title="Experience">
            <p className="text-sm text-charcoal/80">{jdSummary.experienceLevel}</p>
          </Section>
        ) : null}
        {jdSummary.location ? (
          <Section title="Location">
            <p className="text-sm text-charcoal/80">{jdSummary.location}</p>
          </Section>
        ) : null}
        {jdSummary.compensation ? (
          <Section title="Compensation">
            <p className="text-sm text-charcoal/80">{jdSummary.compensation}</p>
          </Section>
        ) : null}
      </div>

      <Section title="Key responsibilities">
        <BulletList items={jdSummary.responsibilities} />
      </Section>
      <Section title="Requirements">
        <BulletList items={jdSummary.requirements} />
      </Section>
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {jdSummary.skills?.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-sand/50 bg-white px-2 py-1 text-xs text-charcoal/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>
      <Section title="Benefits">
        <BulletList items={jdSummary.benefits} />
      </Section>
    </div>
  )
}
