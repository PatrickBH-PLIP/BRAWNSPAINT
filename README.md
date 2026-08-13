# 🎨 BRAWNS PAINT

App de pintura no navegador, com salvamento automático no armazenamento local (localStorage). Site 100% estático — sem build, sem dependências, sem servidor.

## Funcionalidades

- **Cor do plano de fundo** ajustável a qualquer momento.
- **Cor do traço** ajustável, com **modo arco-íris** (a cor muda sozinha enquanto você desenha).
- **8 ferramentas com traços diferentes**: Lápis, Caneta, Marcador (caneta diferente), Rolo de pintura, Pincel P, Pincel M, Pincel G e Borracha.
- **Tamanho do traço/borracha ajustável**, com **prévia visual em tempo real** do tamanho, tanto no painel quanto seguindo o cursor na tela.
- **Botão "Limpar tudo"** para apagar o desenho inteiro.
- **Borracha com tamanho de área ajustável.**
- **Upload de imagem PNG/JPG**, que pode ser **arrastada e redimensionada** na tela antes de ser aplicada ao desenho.
- **Galeria local**: salve várias obras com nome, veja miniaturas, recarregue ou exclua — tudo guardado no navegador.
- **Download em PNG** da arte finalizada.
- **Salvamento automático**: feche o navegador e volte depois — seu desenho continua lá.

Tudo é salvo apenas no seu navegador (`localStorage`), nada é enviado para nenhum servidor.

## Estrutura do projeto

```
brawns-paint/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Como publicar no GitHub

1. Crie um repositório novo no GitHub (ex: `brawns-paint`).
2. Envie estes arquivos para o repositório (pela interface do GitHub: **Add file → Upload files**, arraste os 3 arquivos, ou via linha de comando):
   ```
   git init
   git add .
   git commit -m "BRAWNS PAINT"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/brawns-paint.git
   git push -u origin main
   ```

## Como publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
2. Clique em **Add New → Project**.
3. Selecione o repositório `brawns-paint` que você acabou de subir no GitHub.
4. A Vercel detecta automaticamente que é um site estático — **não é necessário configurar nada** (Framework Preset: "Other", sem build command).
5. Clique em **Deploy** e pronto — em segundos seu app estará no ar com uma URL pública.

Qualquer atualização que você enviar (`git push`) para o repositório será publicada automaticamente pela Vercel.

## Compatibilidade

Funciona em qualquer navegador moderno (Chrome, Edge, Firefox, Safari), no computador ou no celular (com suporte a toque).
