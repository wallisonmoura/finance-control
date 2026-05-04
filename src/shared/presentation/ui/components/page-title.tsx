type PageTitleProps = {
  title: string;
  description?: string;
};

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div>
      <h1 className='text-2xl font-bold tracking-tight text-slate-950'>
        {title}
      </h1>

      {description && (
        <p className='mt-2 text-sm leading-6 text-slate-600'>{description}</p>
      )}
    </div>
  );
}
