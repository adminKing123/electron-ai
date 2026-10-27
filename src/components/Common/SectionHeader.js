const SectionHeader = ({ title, description, action }) => (
  <div className="flex items-end justify-between gap-4 mb-4">
    <div className="min-w-0">
      <h2 className="text-[15px] font-semibold text-ink-975 dark:text-white tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[12px] text-ink-500 dark:text-ink-550 mt-0.5">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export default SectionHeader;
