# Revista Ícaro

Site estático de viagens, turismo e aviação, alimentado exclusivamente pelo CM Hub.

## Local
Requer Node 20+. Sem dependências externas de build.

    npm test
    npm run build
    python3 -m http.server 8080 --directory dist

Abra http://localhost:8080. O Hub precisa permitir a origem exata para testes locais; nunca use uma origem curinga em produção.

## Cloudflare Pages
Conecte este repositório, branch main. Framework: None. Build: npm run build. Diretório de saída: dist. Depois adicione revistaicaro.com.br e www.revistaicaro.com.br em Custom domains.

O endereço pages.dev é definido pela Cloudflare. Depois do primeiro deploy, adicione a origem HTTPS exata desse endereço em Sites → Revista Ícaro → Origens permitidas no Hub para testar antes de configurar o domínio. A origem não é pressuposta pelo código.

## Hub
- Chave: revista-icaro
- Domínio cadastrado: revistaicaro.com.br
- Perfil: icaro
- API: https://hub.cm.com.br/api/v1/sites/by-domain/articles?domain=revistaicaro.com.br
- Publicação: https://hub.cm.com.br/publicacoes/revista-icaro
- Migração necessária no Hub: 20260924120000_register_revista_icaro.rb
- Editorias: destinos, roteiros, hospedagem, sabores, aviacao, guia-do-viajante.
- Posições: hero; icaro_brief_1..3; icaro_card_1..6; icaro_aviation_1..2.

As posições de aviação são manuais para evitar que o preenchimento genérico coloque notícias de outros assuntos nessa seção. O preenchimento automático exige selecionar uma pesquisa/acervo apropriado; esta integração não cria coletor nem agenda de importação de turismo.

O site consulta a API ao abrir e a cada 60 segundos enquanto visível. Cada resposta válida substitui integralmente a edição; uma lista vazia limpa o site. Notícias automáticas sem posição não voltam à capa. Em erro de rede, mostra mensagem e preserva somente a edição em memória; não há cache local persistente, service worker, notícias demonstrativas ou conteúdo alternativo.

A leitura usa a mesma API por domínio, garantindo que a matéria esteja publicada na Ícaro. O conteúdo HTML aceita apenas formatação editorial básica. Fontes e créditos de imagem são exibidos quando fornecidos pelo Hub. A tag de métricas carrega uma única vez nos domínios definitivos, após os metadados da matéria estarem disponíveis. Testes em localhost/pages.dev não geram métricas de produção.

## Validar produção
1. Publicar uma matéria com editoria Destinos na posição hero.
2. Abrir a home e a matéria. Conferir título, imagem, texto, origem e crédito.
3. Conferir POST de analytics retornando 204 no domínio definitivo.
4. Trocar a manchete e aguardar até 60 segundos; a antiga não deve reaparecer.
5. Despublicar a matéria; ela deve desaparecer. Limpar a publicação deve produzir estado vazio.

## Atualizar o Hub na VPS
As alterações estão no branch develop de matheusmoura0/correio-content-hub.

    cd /opt/correio-content-hub
    git switch develop
    git pull --ff-only origin develop
    docker compose --env-file .env.production -f compose.production.yml build web
    docker compose --env-file .env.production -f compose.production.yml run --rm --no-deps web ruby bin/rails db:migrate
    docker compose --env-file .env.production -f compose.production.yml up -d --no-deps web

Em caso de falha em algum comando, interrompa e revise a saída antes de continuar.
A migração cadastra a revista e as editorias; não publica matérias automaticamente.

Repositório do site: https://github.com/matheusmoura0/revista-icaro

Não colocar chaves, senhas ou arquivos .env neste repositório. Não é necessária chave privada no frontend.
