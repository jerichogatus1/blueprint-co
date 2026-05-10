function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-sm font-black tracking-[0.35em] text-amber-200">BLUEPRINT CO.</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Built for protection. Designed for professionals. We keep worksite essentials easy to
            browse, order, and manage.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Emails</p>
            <div className="mt-2 space-y-1">
              <p>ldc-david.student@ua.edu.ph</p>
              <p>kjtsoliman.student@ua.edu.ph</p>
              <p>madblapid.student@ua.edu.ph</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone</p>
            <div className="mt-2 space-y-1">
              <p>0993 742 7632</p>
              <p>0976 344 3047</p>
              <p>0967 034 9447</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs uppercase tracking-[0.28em] text-slate-500">
          Copyright 2026 Blueprint Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
