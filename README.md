# Qota

# comandos do back

## Instalar dependencias do node:
```bash
npm i
```
## Rodar migration:
```bash
npm run migrate
```
## Rodar servidor:
```bash
npm run dev
```

# Documentação da API - Get's

Abaixo, você encontrará informações sobre os parâmetros de consulta suportados pelos endpoints Get.

## Parâmetros de Consulta

Os endpoints da API utilizam os seguintes parâmetros para filtragem, paginação e busca:

| **Parâmetro**   | **Descrição**                                                                                   | **Valores Possíveis**             | **Comportamento/Limites**                                                                                     |
|------------------|------------------------------------------------------------------------------------------------|------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `limit`         | Define o número máximo de registros retornados por página.                                     | Inteiro positivo (ex.: `10`, `20`) | Deve ser > 0. Padrão é `10`. Se menor que 1, retorna erro 400 ("Page and limit must be positive numbers").   |
| `page`          | Define a página atual da paginação.                                                            | Inteiro positivo (ex.: `1`, `2`)   | Deve ser > 0. Padrão é `1`. Se menor que 1, retorna erro 400 ("Page and limit must be positive numbers").    |
| `search` (String) | Busca por texto nos campos `conteudo`, `tema`, `tecnica` ou `modalidade` (case-insensitive).   | Qualquer string (ex.: `"João"`)    | Filtra registros contendo o texto em pelo menos um dos campos especificados. Não diferencia maiúsculas/minúsculas. |
| `showDeleted`   | Controla a exibição de registros deletados (`excludedAt`).                                     | `"true"`, `"false"`, `"only"`      | - `"false"`: apenas não deletados (padrão).<br>- `"true"`: todos (deletados e não deletados).<br>- `"only"`: apenas deletados. |

### Notas
- O parâmetro `search` atualmente suporta apenas buscas por texto (strings). Buscas por números ou booleanos não são práticas no contexto atual, pois os campos pesquisáveis são strings.
- O parâmetro `showDeleted` é útil para gerenciar registros com "soft delete" (exclusão lógica via `excludedAt`).



# Permissões
## Níveis de acesso (por propriedade):
- **Proprietário Master**:
  - Cadastra, gerencia propriedade e permissões
  - Acesso total na propriedade onde possui esse vínculo
- **Usuário Comum**:
  - Acesso restrito à visualização de dados da propriedade

Um mesmo usuário pode ter diferentes permissões em propriedades distintas (ex: `proprietario_master` de uma e `usuario_comum` de outra).


# Escopo do MVP (Fase 1)
- Autenticação (Login/Cadastro com JWT)
- Tela de Dashboard Inicial
- Cadastro de Propriedade
- Tela de Gerenciamento da Propriedade (sem funcionalidades ativas)
- Controle de permissões por propriedade (usuário comum e proprietário master)

# Regras de Validação
- Pelo menos 1 foto obrigatória
- Documento obrigatório
- CEP válido (formato brasileiro)
- `valorEstimado` > 0
- CPF e e-mail devem ser únicos
- Permissões são definidas por propriedade (vínculo específico)
- Apenas o `proprietario_master` de uma propriedade pode alterá-la



# Lista Completa de Endpoints/Controllers:

## Autenticação

POST /api/auth/register (register.Auth.controller.ts)
POST /api/auth/Login (login.Auth.controller.ts)
POST /api/auth/logout (logout.Auth.controller.ts)
POST /api/auth/Refresh (refreshToken.Auth.controller.ts)

## Usuários

GET /api/user/:{id} (get.User.controller.ts)
PUT /api/user/:{id} (update.User.controller.ts)
DELETE /api/user/:{id} (delete.User.controller.ts)'

## Propriedades

POST /api/property/create (create.Property.controller.ts)
GET /api/property/:{id} (get.Property.controller.ts)
PUT /api/property/:{id} (update.Property.controller.ts)
DELETE /api/property/:{id} (delete.Property.controller.ts)
GET /api/property/users:{id} (getUser.Property.controller.ts)
## POST /api/property/document:{id} (uploadDocument.Property.controller.ts)
## POST /api/property/phtos:{id} (uploadPhotos.Property.controller.ts)

POST /api/propriedades/create (create.Property.controller.ts)
GET /api/propriedades/{id} (get.Property.controller.ts)
PUT /api/propriedades/{id} (update.Property.controller.ts)
DELETE /api/propriedades/{id} (delete.Property.controller.ts)
GET /api/usuarios/{id}/propriedades (getUser.Property.controller.ts)
POST /api/propriedades/{id}/documentos (uploadDocument.Property.controller.ts)
POST /api/propriedades/{id}/fotos (uploadPhotos.Property.controller.ts)

## Permissões

GET /api/permission/getUser:{id} (getPropertyUsers.Permission.controller.ts)
## POST /api/permission/addUser:{id} (addUsersToProperty.Permission.controller.ts)
## PUT /api/permission/updateUser:{id} (updateUser.Permission.controller.ts)
## DELETE /api/permission/removeUser:{id} (removeUserFromProperty.Permission.controller.ts)

GET /api/propriedades/{id}/usuarios (getPropertyUsers.Permission.controller.ts)
POST /api/propriedades/{id}/usuarios (addUsersToProperty.Permission.controller.ts)
PUT /api/propriedades/{id}/usuarios/{idUsuario}/permissao (updateUser.Permission.controller.ts)
DELETE /api/propriedades/{id}/usuarios/{idUsuario} (removeUserFromProperty.Permission.controller.ts)

## Documentos da Propriedade

## GET /api/propertyDocuments/:{id} (get.PropertyPhoto.controller.ts)
## DELETE /api/propertyDocuments/:{id} (delete.PropertyPhoto.controller.ts)

GET /api/propriedades/{id}/documentos (get.PropertyDocuments.controller.ts)
DELETE /api/propriedades/{id}/documentos/{docId} (delete.PropertyDocuments.controller.ts)

## Fotos da Propriedade

## GET /api/propertyPhoto/:{id} (get.PropertyDocuments.controller.ts)
## DELETE /api/propertyPhoto/:{id} (delete.PropertyDocuments.controller.ts)

GET /api/propriedades/{id}/fotos (get.PropertyPhoto.controller.ts)
DELETE /api/propriedades/{id}/fotos/{fotoId} (delete.PropertyPhoto.controller.ts)





# Banco de Dados

## Tabela: User
```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String
  refreshToken  String?   @unique
  nomeCompleto  String    @unique // Adicionei @unique para manter a restrição
  telefone      String?
  cpf           String    @unique
  dataCadastro  DateTime  @default(now())
  propriedades  UsuariosPropriedades[]
}
```

## Tabela: Propriedades
```prisma
model Propriedades {
  id                    Int       @id @default(autoincrement())
  nomePropriedade       String
  enderecoCep           String?
  enderecoCidade        String?
  enderecoBairro        String?
  enderecoLogradouro    String?
  enderecoNumero        String?
  enderecoComplemento   String?
  enderecoPontoReferencia String?
  tipo                  String    // Casa, Apartamento, Chacara, Lote, Outros
  valorEstimado         Float?
  documento             String?
  dataCadastro          DateTime  @default(now())
  usuarios              UsuariosPropriedades[]
  fotos                 FotosPropriedade[]
  documentos            DocumentosPropriedade[]
}
```

## Tabela: UsuariosPropriedades
```prisma
model UsuariosPropriedades {
  id            Int       @id @default(autoincrement())
  idUsuario     Int
  idPropriedade Int
  permissao     String    // proprietario_master, usuario_comum
  dataVinculo   DateTime  @default(now())
  usuario       User      @relation(fields: [idUsuario], references: [id])
  propriedade   Propriedades @relation(fields: [idPropriedade], references: [id])

  @@unique([idUsuario, idPropriedade])
}
```

## Tabela: FotosPropriedade
```prisma
model FotosPropriedade {
  id            Int       @id @default(autoincrement())
  idPropriedade Int
  documento     String
  dataUpload    DateTime  @default(now())
  propriedade   Propriedades @relation(fields: [idPropriedade], references: [id])
}
```

## Tabela: DocumentosPropriedade
```prisma
model DocumentosPropriedade {
  id            Int       @id @default(autoincrement())
  idPropriedade Int
  tipoDocumento String    // IPTU, Matricula, Conta_de_Luz, Outros
  documento     String
  dataUpload    DateTime  @default(now())
  propriedade   Propriedades @relation(fields: [idPropriedade], references: [id])
}
```