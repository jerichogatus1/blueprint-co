import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const fallbackSlides = [
  { id: 'product-01-safety-helmet', name: 'Safety Helmet (Hard Hat)', imageUrl: '/images/products/Safety Helmet (Hard Hat).png' },
  { id: 'product-02-safety-vest', name: 'Safety Vest', imageUrl: '/images/products/Safety Vest.png' },
  { id: 'product-03-safety-gloves', name: 'Safety Gloves', imageUrl: '/images/products/Safety Gloves.png' },
  { id: 'product-04-safety-boots', name: 'Safety Boots', imageUrl: '/images/products/Safety Boots.png' },
  { id: 'product-05-safety-goggles', name: 'Safety Goggles', imageUrl: '/images/products/Safety Goggles.png' },
  { id: 'product-06-ear-protection', name: 'Ear Protection (Earmuffs)', imageUrl: '/images/products/Ear Protection (Earmuffs).png' },
  { id: 'product-07-toolbox-kit', name: 'Toolbox Kit', imageUrl: '/images/products/Toolbox Kit.png' },
  { id: 'product-08-measuring-tape', name: 'Measuring Tape', imageUrl: '/images/products/Measuring Tape.png' },
  { id: 'product-09-safety-signage', name: 'Safety Signage', imageUrl: '/images/products/Safety Signage.png' },
  { id: 'product-10-full-ppe-kit', name: 'Full PPE Kit Package', imageUrl: '/images/products/Full PPE Kit Package.png' }
];

function Home() {
  const { user } = useAuth();
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState(fallbackSlides);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: null
  });

  useEffect(() => {
    let alive = true;

    const loadProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const products = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .sort((left, right) => {
            const leftCode = Number.parseInt(left.code || '', 10);
            const rightCode = Number.parseInt(right.code || '', 10);

            if (!Number.isNaN(leftCode) && !Number.isNaN(rightCode)) {
              return leftCode - rightCode;
            }

            return String(left.name || '').localeCompare(String(right.name || ''));
          })
          .map((product) => ({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl || product.image
          }))
          .filter((product) => product.imageUrl);

        if (alive && products.length > 0) {
          setSlides(products);
        }
      } catch (error) {
        console.error('Error loading homepage products:', error);
      }
    };

    void loadProducts();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    let rafId = 0;

    const updateActiveIndex = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerRect = scroller.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const rect = slide.getBoundingClientRect();
          const slideCenter = rect.left + rect.width / 2;
          const distance = Math.abs(containerCenter - slideCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      });
    };

    scroller.addEventListener('scroll', updateActiveIndex, { passive: true });
    updateActiveIndex();

    return () => {
      cancelAnimationFrame(rafId);
      scroller.removeEventListener('scroll', updateActiveIndex);
    };
  }, []);

  const scrollToSlide = (index) => {
    const target = slideRefs.current[index];
    if (!target) return;
    target.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
    setActiveIndex(index);
  };

  const handlePointerDown = (event) => {
    const scroller = scrollerRef.current;
    if (!scroller || event.button !== 0) return;

    dragStateRef.current = {
      dragging: true,
      startX: event.clientX,
      startScrollLeft: scroller.scrollLeft,
      pointerId: event.pointerId
    };

    scroller.setPointerCapture?.(event.pointerId);
    scroller.classList.add('is-dragging');
  };

  const handlePointerMove = (event) => {
    const scroller = scrollerRef.current;
    const dragState = dragStateRef.current;
    if (!scroller || !dragState.dragging || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    scroller.scrollLeft = dragState.startScrollLeft - deltaX;
  };

  const stopDragging = (event) => {
    const scroller = scrollerRef.current;
    const dragState = dragStateRef.current;
    if (!scroller || !dragState.dragging) return;

    if (dragState.pointerId !== null && event?.pointerId === dragState.pointerId) {
      scroller.releasePointerCapture?.(dragState.pointerId);
    }

    dragStateRef.current = {
      dragging: false,
      startX: 0,
      startScrollLeft: 0,
      pointerId: null
    };

    scroller.classList.remove('is-dragging');
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.18), transparent 24%), radial-gradient(circle at 80% 0%, rgba(59, 130, 246, 0.22), transparent 22%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.16), transparent 20%), linear-gradient(135deg, rgba(2, 6, 23, 0.98), rgba(15, 23, 42, 0.92))'
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27240%27 height=%27240%27 viewBox=%270 0 240 240%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27 opacity=%270.18%27%3E%3Cpath d=%27M0 0h240v240H0z%27/%3E%3Cpath d=%27M24 24h192v192H24z%27 stroke=%27%23ffffff%27 stroke-width=%270.5%27/%3E%3Cpath d=%27M0 120h240M120 0v240%27 stroke=%27%23ffffff%27 stroke-width=%270.35%27/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      <section className="relative mx-auto flex h-[calc(100vh-180px)] max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        <div className="grid w-full gap-6 lg:grid-cols-2 xl:gap-8">
          <div className="max-w-xl self-center lg:max-w-none lg:pr-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              PPE and worksite safety equipment
            </div>

            <h1 className="mt-4 max-w-lg text-4xl font-black leading-[0.94] tracking-tight text-balance text-white sm:text-5xl lg:text-5xl">
              Safety gear that feels ready for business.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-[0.95rem]">
              Browse dependable PPE, place orders fast, and keep every site stocked with gear your team can trust.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
              >
                Explore Products
              </Link>
              <Link
                to={user ? '/orders' : '/login'}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                {user ? 'View Orders' : 'Sign In'}
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Trusted supply</p>
                <p className="mt-1 text-sm font-semibold text-white">Reliable gear for every worksite</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Fast ordering</p>
                <p className="mt-1 text-sm font-semibold text-white">Shop quickly and move to checkout</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Built for teams</p>
                <p className="mt-1 text-sm font-semibold text-white">Professional PPE made easy</p>
              </div>
            </div>
          </div>

          <div className="relative self-center lg:pl-6">
            <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />

            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center gap-4 border-b border-white/10 bg-slate-900/75 px-4 py-2.5 sm:px-5">
                <img
                  src="/images/Logo.png"
                  alt="Blueprint Co. logo"
                  className="h-9 w-9 rounded-2xl bg-white/10 object-contain p-1.5 sm:h-10 sm:w-10"
                />
                <div className="min-w-0">
                  <p className="truncate text-[10px] uppercase tracking-[0.28em] text-slate-400 sm:text-[11px]">
                    Blueprint Co.
                  </p>
                  <p className="truncate text-xs font-semibold text-white sm:text-sm">
                    Safety gear shown like a catalog.
                  </p>
                </div>
              </div>

              <div className="px-3 pb-3 pt-2.5 sm:px-4">
                <div className="mb-3 flex items-center justify-between px-1 text-[10px] uppercase tracking-[0.35em] text-slate-400">
                  <span>Swipe to browse</span>
                  <span>Products</span>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-950/90 to-transparent sm:w-14" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-950/90 to-transparent sm:w-14" />

                  <div
                    ref={scrollerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopDragging}
                    onPointerCancel={stopDragging}
                    onPointerLeave={stopDragging}
                    className="scrollbar-hide flex gap-3 overflow-x-auto overflow-y-hidden px-1 py-1.5 snap-x snap-mandatory scroll-smooth select-none cursor-grab touch-pan-y sm:gap-4"
                  >
                    {slides.map((slide, index) => {
                      const isActive = index === activeIndex;
                      const isAdjacent = Math.abs(index - activeIndex) === 1;
                      const scaleClass = isActive
                        ? 'scale-100 opacity-100'
                        : isAdjacent
                          ? 'scale-[0.96] opacity-85'
                          : 'scale-[0.92] opacity-65';

                      return (
                        <Link
                          key={slide.id}
                          ref={(node) => {
                            slideRefs.current[index] = node;
                          }}
                          to={`/product/${slide.id}`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onFocus={() => setActiveIndex(index)}
                          className={`group flex-none basis-[82%] snap-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-900/80 shadow-lg shadow-black/20 transition duration-300 sm:basis-[46%] lg:basis-[30%] ${scaleClass}`}
                        >
                          <div className="aspect-[4/5] bg-slate-950">
                            <img
                              src={slide.imageUrl}
                              alt={slide.name}
                              className={`h-full w-full object-cover transition duration-300 ${
                                isActive ? 'scale-105' : 'scale-100'
                              }`}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <p className="line-clamp-2 text-sm font-semibold text-white">{slide.name}</p>
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full transition ${
                                isActive ? 'bg-amber-400' : 'bg-white/25'
                              }`}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {slides.map((slide, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => scrollToSlide(index)}
                        aria-label={`View ${slide.name}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isActive ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
