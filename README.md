# Image Utility

Transforme imagens em minutos — comprima, converta, redimensione, recorte, gere favicons, exporte para PDF e crie QR codes com uma interface limpa e rápida.

Por que este projeto?
- Economia de tempo: faça tarefas comuns de imagem direto no navegador.
- Fluxo claro: upload → ajuste → download com pré-visualização instantânea.
- Versatilidade: ideal para desenvolvedores, designers e criadores de conteúdo.

Recursos principais
- Compressão com comparação antes/depois
- Conversão entre formatos (PNG, JPG, WebP, etc.)
- Redimensionamento com preview em tempo real
- Recorte com controle de proporção e área
- Geração de favicon a partir de imagens
- Exportação para PDF
- Geração de QR codes a partir de texto ou URLs

Estrutura do repositório
- `app/` — páginas e rotas (ex.: `/compress`, `/convert`, `/resize`, `/crop`, `/favicon`, `/pdf`, `/qrcode`).
- `components/` — componentes e formulários reutilizáveis.
- `styles/` — estilos globais.

Stack técnico
- Next.js + TypeScript
- React function components
- PostCSS
- `pnpm` para gerenciamento de pacotes

Como rodar localmente
```bash
pnpm install
pnpm dev
```
Abra `http://localhost:3000` e teste as rotas das ferramentas.

Boas práticas
- Faça backup dos originais antes de processar em lote.
- Ajuste a qualidade gradualmente para equilibrar tamanho e fidelidade.

Contribuindo
- Fork → branch (`feature/nome`) → PR com descrição das mudanças.
- Abra issues para sugestões, bugs ou melhorias de UX.

Roadmap curto
- Testes automatizados para fluxos críticos
- Processamento em background / filas para cargas maiores
- Integração com provedores de storage (S3, GCS)

Contato
- Repositório: https://github.com/brsantos197/image-utility
