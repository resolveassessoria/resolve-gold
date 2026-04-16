

## Problemas Identificados e Plano de Correção

### Problema 1: Trigger `handle_new_user` não está ativo
A função `handle_new_user` existe mas o trigger no `auth.users` não aparece na lista de triggers. Isso significa que ao criar um usuário, o perfil na tabela `profiles` pode não ser criado automaticamente.

**Correção:** Criar uma migração SQL que adiciona o trigger:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Problema 2: Warning de `forwardRef` no `WhatsAppButton`
O componente é passado como ref sem usar `React.forwardRef()`.

**Correção:** Envolver o componente com `forwardRef` ou remover o ref desnecessário.

### Problema 3: Toast de erro no login pode não estar aparecendo
O login com email não confirmado não mostra feedback visível claro ao usuário.

**Correção:** Verificar se o `toast.error` está sendo chamado corretamente e se o componente Sonner está posicionado adequadamente.

### Resumo das alterações
1. **Migração SQL** — Criar trigger `on_auth_user_created` ligando `auth.users` à função `handle_new_user`
2. **WhatsAppButton.tsx** — Corrigir warning de forwardRef
3. **Login.tsx** — Garantir que erros de autenticação (como email não confirmado) mostrem toast visível

