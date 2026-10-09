# Base de validação — FinancesHub

Data: 08/10/2026
Branch: chore/base-validation
Commit inicial: 49b6ebc

## Ambiente
- Node: v22.12.0
- Yarn: 1.22.22
- Plataforma/dispositivo: macOS e iOS
- Versão do sistema: Tahoe 26.5.2 (25F84) e iOS 26.6.1

## Verificações automáticas
| Verificação | Comando | Código de saída | Resultado | Resumo |
|---|---|---|---|---|
| ESLint | yarn lint | 1 | 12 errors e 101 warnings | Erros principais são de declaro mas não utilizado e warnings de "inline styles"; 5 erros de hooks utilizados de forma errada. |
| TypeScript | yarn tsc --noEmit | 0 | Sucesso | Sucesso |
| Jest | yarn test --watch=false --runInBand | 1 | 1 Falha de 1 teste | Jest encountered an unexpected token |

## Execução do aplicativo
- Comando utilizado: yarn ios
- Resultado: Sucesso
- Plataforma não executada e motivo: Por enquanto faremos somente para iOS

## Checklist manual
| Cenário | Resultado | Observações |
|---|---|---|
| Acesso | Funcionando | Por enquanto está somente local |
| Categorias | Funcionando |  |
| Transações e filtros | Limitação no iOS | Teclado númerico do valor não está fechando, impossibilitando a adição |
| Gastos fixos | Limitação no iOS | Mesma limitação das transações |
| Navegação | Funcionando | Melhorar a navegação |
| Dashboard e relatórios | Pendente | Como não é possível adicionar transações não foi possível validar os dashboards e relatórios |
| Persistência após reabrir | Parcial | Foi possível validar somente a persistência das categorias |

## Problemas conhecidos
- Icones não carregando no iOS;
- Estilização quebrada no iOS;
- Aplicativo crashando no iOS:
  - Sem causa descborta.
## Limitações da validação
- Não foi possível validar a adição de gastos:
  - Teclado númerico não está fechando.