function LoadingSpinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex min-h-[45vh] items-center justify-center px-4 ${className}`}>
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center text-white/80 backdrop-blur-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
        <p className="text-sm font-medium tracking-wide">{label}...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
