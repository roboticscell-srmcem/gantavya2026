"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { gsap } from "gsap";

/* -------------------------------------------------------------------------- */
/*                              SSR-SAFE MEDIA HOOK                            */
/* -------------------------------------------------------------------------- */

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
): number => {
  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getValue = () =>
      values[queries.findIndex(q => window.matchMedia(q).matches)] ??
      defaultValue;

    setValue(getValue());

    const handler = () => setValue(getValue());
    const media = queries.map(q => window.matchMedia(q));

    media.forEach(mq => mq.addEventListener("change", handler));
    return () => media.forEach(mq => mq.removeEventListener("change", handler));
  }, [queries, values, defaultValue]);

  return value;
};

/* -------------------------------------------------------------------------- */
/*                              SIZE OBSERVER HOOK                             */
/* -------------------------------------------------------------------------- */

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

/* -------------------------------------------------------------------------- */
/*                                IMAGE PRELOAD                                */
/* -------------------------------------------------------------------------- */

const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                     */
/* -------------------------------------------------------------------------- */

interface Item {
  id: string;
  img: string;
  url?: string;
  height: number;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                   */
/* -------------------------------------------------------------------------- */

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false
}) => {
  const columns = useMedia(
    ["(min-width:1500px)", "(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  /* ------------------------------ INITIAL POSITIONS ------------------------------ */

  const getInitialPosition = (item: GridItem) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: item.x, y: item.y };

    let dir = animateFrom;
    if (dir === "random") {
      const dirs = ["top", "bottom", "left", "right"] as const;
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (dir) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: rect.width / 2 - item.w / 2,
          y: rect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y };
    }
  };

  /* ------------------------------ PRELOAD IMAGES ------------------------------ */

  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  /* ------------------------------ GRID CALCULATION ------------------------------ */

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];

    const gap = 16;
    const columnWidth = (width - (columns - 1) * gap) / columns;
    const heights = new Array(columns).fill(0);

    return items.map(item => {
      const col = heights.indexOf(Math.min(...heights));
      const x = col * (columnWidth + gap);
      const h = item.height / 2;
      const y = heights[col];

      heights[col] += h + gap;
      return { ...item, x, y, w: columnWidth, h };
    });
  }, [items, width, columns]);

  /* ------------------------------ GSAP ANIMATIONS ------------------------------ */

  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.forEach((item, i) => {
      const selector = `[data-key="${item.id}"]`;
      const to = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const from = getInitialPosition(item);

        gsap.fromTo(
          selector,
          {
            opacity: 0,
            ...from,
            ...(blurToFocus && { filter: "blur(10px)" })
          },
          {
            opacity: 1,
            ...to,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            ease: "power3.out",
            delay: i * stagger
          }
        );
      } else {
        gsap.to(selector, { ...to, duration, ease, overwrite: "auto" });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady, stagger, blurToFocus, duration, ease]);

  /* ------------------------------ HOVER EFFECTS ------------------------------ */

  const onEnter = (id: string, el: HTMLElement) => {
    if (scaleOnHover)
      gsap.to(`[data-key="${id}"]`, { scale: hoverScale, duration: 0.3 });

    if (colorShiftOnHover) {
      const overlay = el.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const onLeave = (id: string, el: HTMLElement) => {
    if (scaleOnHover)
      gsap.to(`[data-key="${id}"]`, { scale: 1, duration: 0.3 });

    if (colorShiftOnHover) {
      const overlay = el.querySelector(".color-overlay") as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute box-content"
          style={{ willChange: "transform, width, height, opacity" }}
          {...(item.url && {
            onClick: () => window.open(item.url, "_blank", "noopener"),
            style: { willChange: "transform, width, height, opacity", cursor: "pointer" }
          })}
          onMouseEnter={e => onEnter(item.id, e.currentTarget)}
          onMouseLeave={e => onLeave(item.id, e.currentTarget)}
        >
          <div
            className="relative w-full h-full bg-cover bg-center rounded-[10px]"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
