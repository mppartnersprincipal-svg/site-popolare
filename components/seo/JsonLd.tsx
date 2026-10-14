interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** JSON-LD gerado só a partir de data/ (conteúdo controlado); "<" é escapado para não fechar a tag. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
