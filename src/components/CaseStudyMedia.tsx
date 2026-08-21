type CaseStudyMediaProps = {
  alt: string;
  image: string;
  loading?: "eager" | "lazy";
  slug: string;
};

const caseStudyMediaVisuals: Record<
  string,
  {
    background: string;
    backgroundColor?: string;
    frameBackground?: string;
    frameBackgroundColor?: string;
    frameClassName: string;
    imageClassName: string;
    stageClassName: string;
  }
> = {
  kraidle: {
    background: "linear-gradient(98.4deg, #0a0a0a 0%, #0d9488 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-cover",
    stageClassName: "p-4",
  },
  "dynamic-plan": {
    background: "linear-gradient(98.4deg, #193d9b 0%, #fd9160 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "absolute inset-y-0 left-0 h-full w-auto max-w-none",
    stageClassName: "p-4",
  },
  quilt: {
    background: "linear-gradient(98.4deg, #7569cf 0%, #ade9ba 100%)",
    frameBackground: "none",
    frameBackgroundColor: "#fff",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-cover",
    stageClassName: "p-4",
  },
  keel: {
    background: "linear-gradient(98.4deg, #d0f1f9 0%, #8be4c6 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "absolute left-0 top-[-2.55%] h-[107.13%] w-full max-w-none",
    stageClassName: "p-4",
  },
  studio: {
    background:
      "linear-gradient(180deg, rgba(110, 94, 255, 0.50) 0%, rgba(222, 124, 233, 0.40) 100%)",
    backgroundColor: "#fff",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-contain",
    stageClassName: "p-4",
  },
};

export function CaseStudyMedia({
  alt,
  image,
  loading = "lazy",
  slug,
}: CaseStudyMediaProps) {
  const visual = caseStudyMediaVisuals[slug] ?? caseStudyMediaVisuals.kraidle;

  return (
    <span
      aria-hidden={alt ? undefined : true}
      className={`relative isolate block w-full ${visual.stageClassName}`}
      data-card-media-stage
    >
      <span
        className="case-study-media-backdrop pointer-events-none absolute inset-0 z-0 rounded-lg"
        style={{
          backgroundColor: visual.backgroundColor,
          backgroundImage: visual.background,
        }}
      />
      <span
        className={`relative z-10 block w-full overflow-hidden rounded-lg ${visual.frameClassName}`}
        style={{
          backgroundColor: visual.frameBackgroundColor ?? visual.backgroundColor,
          backgroundImage: visual.frameBackground ?? visual.background,
        }}
      >
        <img
          alt={alt}
          className={visual.imageClassName}
          decoding="async"
          loading={loading}
          src={image}
        />
      </span>
    </span>
  );
}
