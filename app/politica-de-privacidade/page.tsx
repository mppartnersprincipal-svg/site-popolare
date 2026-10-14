import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BRAND, MAIN_UNIT, formatAddress } from "@/data/business";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidade",
  description: "Como a Popolare Massas e Empório trata dados pessoais e cookies neste site, em conformidade com a LGPD (Lei nº 13.709/2018).",
  path: "/politica-de-privacidade",
});

// TODO(cliente): validar o texto com a Popolare (razão social, CNPJ e e-mail do encarregado de dados)
const SECOES = [
  {
    titulo: "Quem somos",
    texto: `${BRAND.name}, com loja principal em ${formatAddress(MAIN_UNIT)}, é a controladora dos dados tratados neste site.`,
  },
  {
    titulo: "Quais dados coletamos",
    texto:
      "Dados de navegação (páginas visitadas, origem da visita, tipo de dispositivo) por meio de cookies de medição e publicidade, somente se você aceitar no aviso de cookies. O formulário de encomendas não armazena dados no site: as informações são montadas numa mensagem e enviadas por você ao WhatsApp da loja.",
  },
  {
    titulo: "Para que usamos",
    texto:
      "Para entender como o site é usado, melhorar o conteúdo, medir os resultados de anúncios e responder pedidos e encomendas feitos pelo WhatsApp.",
  },
  {
    titulo: "Com quem compartilhamos",
    texto:
      "Com ferramentas de medição e anúncios (Google Analytics, Google Ads e Meta), apenas mediante consentimento, e com o WhatsApp (Meta) quando você decide enviar uma mensagem. Não vendemos dados pessoais.",
  },
  {
    titulo: "Cookies e consentimento",
    texto:
      "Cookies de medição e publicidade ficam desativados até você clicar em “Aceitar”. Você pode mudar de ideia a qualquer momento limpando os dados do site no navegador; o aviso aparecerá de novo.",
  },
  {
    titulo: "Seus direitos (LGPD, art. 18)",
    texto:
      "Você pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus dados, além de informações sobre compartilhamento e a revogação do consentimento.",
  },
  {
    titulo: "Contato",
    texto: `Para exercer seus direitos ou tirar dúvidas, fale com a loja pelo WhatsApp ${MAIN_UNIT.whatsappDisplay} ou pelo telefone ${MAIN_UNIT.phones[0]}.`,
  },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Política de" accent="privacidade." path="/politica-de-privacidade" crumb="Política de privacidade" />
      <div className="container-popolare max-w-3xl space-y-10 pb-24">
        {SECOES.map((s) => (
          <section key={s.titulo}>
            <h2 className="italiano text-3xl text-tinta">{s.titulo}</h2>
            <p className="mt-3 text-lg leading-relaxed text-tinta-suave">{s.texto}</p>
          </section>
        ))}
        <p className="text-sm text-tinta-suave">Última atualização: outubro de 2026.</p>
      </div>
    </>
  );
}
