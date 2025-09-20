# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Voltar para a página inicial" [ref=e3] [cursor=pointer]:
    - /url: /
    - text: 🏠 Home
  - region "Carrinho de compras" [ref=e5]:
    - heading "Carrinho" [level=2] [ref=e7]
    - generic [ref=e8]:
      - paragraph [ref=e9]: Seu carrinho está vazio.
      - button "Ir para os pedidos" [ref=e10]
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Subtotal
        - strong [ref=e14]: R$0.00
      - button "Finalizar" [disabled] [ref=e16]
```