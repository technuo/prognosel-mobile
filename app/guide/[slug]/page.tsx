import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticleSlugs, ArticleData, ArticleBlock } from "./articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return { title: "Artikel hittades inte | PrognosEL" };
  }

  return {
    title: `${article.title} | PrognosEL`,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `https://prognosel.energy/guide/${article.slug}/`,
    },
    openGraph: {
      type: "article",
      url: `https://prognosel.energy/guide/${article.slug}/`,
      title: article.title,
      description: article.description,
      locale: "sv_SE",
      publishedTime: article.published,
      modifiedTime: article.updated,
      authors: ["PrognosEL"],
      tags: article.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function ArticleSchema({ article }: { article: ArticleData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "PrognosEL",
      url: "https://prognosel.energy",
    },
    publisher: {
      "@type": "Organization",
      name: "PrognosEL",
      logo: {
        "@type": "ImageObject",
        url: "https://prognosel.energy/og-image.png",
      },
    },
    datePublished: article.published,
    dateModified: article.updated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://prognosel.energy/guide/${article.slug}/`,
    },
    keywords: article.keywords.join(", "),
    articleSection: article.category,
    inLanguage: "sv-SE",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FaqSchema({ faq }: { faq: { q: string; a: string }[] }) {
  if (!faq || faq.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function ContentBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p style={{ color: "#5C554C", fontSize: 16, lineHeight: 1.75, margin: "0 0 20px" }}>
          {block.text}
        </p>
      );
    case "heading":
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      const headingSize = block.level === 3 ? 20 : 28;
      const headingMargin = block.level === 3 ? "28px 0 12px" : "40px 0 16px";
      return (
        <HeadingTag
          id={block.text?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 40)}
          style={{
            fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif",
            fontSize: headingSize,
            fontWeight: 700,
            color: "#1C1814",
            lineHeight: 1.3,
            margin: headingMargin,
          }}
        >
          {block.text}
        </HeadingTag>
      );
    case "list":
      return (
        <ul style={{ margin: "0 0 24px", paddingLeft: 24, color: "#5C554C", fontSize: 16, lineHeight: 1.75 }}>
          {block.items?.map((item, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
      );
    case "highlight":
      return (
        <div
          style={{
            background: "#F4E4DC",
            borderLeft: "3px solid #C4623A",
            borderRadius: "0 12px 12px 0",
            padding: "20px 24px",
            margin: "24px 0",
            color: "#5C554C",
            fontSize: 16,
            lineHeight: 1.65,
            fontStyle: "italic",
          }}
        >
          {block.text}
        </div>
      );
    case "link":
      return (
        <div style={{ margin: "24px 0 32px" }}>
          <Link
            href={block.href || "/"}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#C4623A",
              textDecoration: "none",
            }}
          >
            {block.label} →
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 720, margin: "0 auto" }}>
      <ArticleSchema article={article} />
      <FaqSchema faq={article.faq} />

      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 14, color: "#8C847C", textDecoration: "none", fontWeight: 500 }}>
          ← PrognosEL
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#C4623A",
            background: "#F4E4DC",
            padding: "4px 10px",
            borderRadius: 100,
          }}
        >
          {article.category}
        </span>
        <span style={{ fontSize: 13, color: "#B5AFA8" }}>{article.readTime} läsning</span>
      </div>

      <h1
        style={{
          fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          lineHeight: 1.15,
          color: "#1C1814",
          margin: "0 0 20px",
        }}
      >
        {article.title}
      </h1>

      <p style={{ color: "#8C847C", fontSize: 17, lineHeight: 1.65, margin: "0 0 32px" }}>
        {article.description}
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 13,
          color: "#B5AFA8",
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: "1px solid rgba(28,24,20,0.08)",
        }}
      >
        <span>Publicerad {article.published}</span>
        <span>·</span>
        <span>Uppdaterad {article.updated}</span>
      </div>

      {/* Table of Contents */}
      {article.toc.length > 0 && (
        <div
          style={{
            background: "#F5F1EB",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 40,
            border: "1px solid rgba(28,24,20,0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: "#C4623A",
              marginBottom: 12,
            }}
          >
            Innehållsförteckning
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {article.toc.map((item) => (
              <li key={item.id} style={{ marginBottom: 6 }}>
                <a
                  href={`#${item.id}`}
                  style={{
                    fontSize: 14,
                    color: "#5C554C",
                    textDecoration: "none",
                    paddingLeft: item.level === 3 ? 16 : 0,
                    display: "inline-block",
                    padding: "4px 0",
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Article Content */}
      <article>
        {article.content.map((block, i) => (
          <ContentBlock key={i} block={block} />
        ))}
      </article>

      {/* FAQ Section */}
      {article.faq.length > 0 && (
        <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(28,24,20,0.08)" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#1C1814",
              margin: "0 0 24px",
            }}
          >
            Vanliga frågor
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {article.faq.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#F5F1EB",
                  borderRadius: 12,
                  padding: "20px 24px",
                  border: "1px solid rgba(28,24,20,0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1C1814",
                    margin: "0 0 8px",
                  }}
                >
                  {item.q}
                </h3>
                <p style={{ color: "#8C847C", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div
        style={{
          marginTop: 48,
          background: "#F4E4DC",
          borderRadius: 16,
          padding: "28px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#1C1814",
            margin: "0 0 8px",
          }}
        >
          Vill du se dagens elpriser?
        </p>
        <p style={{ color: "#8C847C", fontSize: 14, margin: "0 0 16px" }}>
          Följ elpriserna i realtid och planera din förbrukning smart.
        </p>
        <Link
          href="/elpriser"
          style={{
            display: "inline-block",
            background: "#C4623A",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Se elpriser idag →
        </Link>
      </div>
    </div>
  );
}
