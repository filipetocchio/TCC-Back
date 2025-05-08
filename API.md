# 📘 Documentação da API - QOTA

## 🔑 Autenticação

Todas as rotas protegidas exigem o uso de token JWT no header da requisição:

```
Authorization: Bearer <seu-token-jwt>
```

---

## 👤 Usuários

### 🔹 Criar usuário

**POST** `/api/usuarios/cadastrar`

**Body:**

```json
{
  "nomeCompleto": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "telefone": "11999999999",
  "cpf": "12345678900"
}
```

**Respostas:**

* `201 Created` – Usuário cadastrado com sucesso
* `400 Bad Request` – Dados inválidos ou CPF/email já cadastrados

---

### 🔹 Login

**POST** `/api/usuarios/login`

**Body:**

```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Respostas:**

```json
{
  "token": "JWT-TOKEN-GERADO",
  "usuario": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@email.com"
  }
}
```

* `200 OK` – Login realizado
* `401 Unauthorized` – Credenciais inválidas

---

### 🔹 Buscar usuário por ID

**GET** `/api/usuarios/{id}`

**Headers:**

```
Authorization: Bearer <token>
```

**Resposta:**

```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "cpf": "12345678900"
}
```

---

### 🔹 Atualizar usuário

**PUT** `/api/usuarios/{id}`

**Body:** (campos opcionais)

```json
{
  "nomeCompleto": "Novo Nome",
  "telefone": "11988888888"
}
```

---

### 🔹 Deletar usuário

**DELETE** `/api/usuarios/{id}`

**Resposta:**

* `204 No Content` – Usuário removido

---

## 🏡 Propriedades

### 🔹 Cadastrar propriedade

**POST** `/api/propriedades/cadastrar`

**Body:**

```json
{
  "nomePropriedade": "Chácara Primavera",
  "valorEstimado": 500000,
  "tipo": "Chacara",
  "cep": "12345-678",
  "cidade": "São Paulo",
  "bairro": "Centro",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Casa 2",
  "pontoReferencia": "Próximo ao lago",
  "documento": "url-ou-base64",
  "fotos": ["url-ou-base64"]
}
```

**Respostas:**

* `201 Created` – Propriedade cadastrada e vinculada ao usuário como `proprietario_master`

---

### 🔹 Buscar propriedade por ID

**GET** `/api/propriedades/{id}`

**Resposta:**

```json
{
  "id": 1,
  "nomePropriedade": "Chácara Primavera",
  "valorEstimado": 500000,
  "tipo": "Chacara",
  "cep": "12345-678",
  "cidade": "São Paulo",
  "bairro": "Centro",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Casa 2",
  "pontoReferencia": "Próximo ao lago",
  "documento": "url-ou-base64",
  "fotos": ["url1.jpg", "url2.jpg"]
}
```

---

### 🔹 Atualizar propriedade

**PUT** `/api/propriedades/{id}`

**Body:** (campos opcionais)

```json
{
  "valorEstimado": 600000,
  "tipo": "Lote"
}
```

---

### 🔹 Deletar propriedade

**DELETE** `/api/propriedades/{id}`

**Resposta:**

* `204 No Content`

---

### 🔹 Listar propriedades do usuário

**GET** `/api/usuarios/{id}/propriedades`

**Resposta:**

```json
[
  {
    "id": 1,
    "nomePropriedade": "Chácara Primavera",
    "imagemPrincipal": "url1.jpg",
    "tipo": "Chácara",
    "cep": "12345-678",
    "permissao": "proprietario_master"
  }
]
```

---

## 🔐 Permissões e Vínculos

### 🔹 Listar usuários vinculados à propriedade

**GET** `/api/propriedades/{id}/usuarios`

**Resposta:**

```json
[
  {
    "idUsuario": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@email.com",
    "permissao": "proprietario_master"
  }
]
```

---

### 🔹 Atribuir permissão a usuário

**POST** `/api/propriedades/{id}/usuarios/{idUsuario}/permissao`

**Body:**

```json
{
  "permissao": "usuario_comum"
}
```

---

### 🔹 Remover usuário da propriedade

**DELETE** `/api/propriedades/{id}/usuarios/{idUsuario}`

**Resposta:**

* `204 No Content`

---

## ⚙️ Regras de Validação

* CPF e email únicos
* Valor estimado > 0
* CEP deve seguir padrão brasileiro
* Documento obrigatório
* Pelo menos 1 foto obrigatória
* Permissões são atribuídas por propriedade
* Apenas `proprietario_master` pode alterar dados da propriedade ou gerenciar permissões

---

## 🔗 Padrões de Integração

* JSON em `camelCase`
* Autenticação obrigatória com JWT

---

## 🧱 Estrutura de Banco de Dados (SQL Simplificado)

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomeCompleto VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(15),
  cpf VARCHAR(14) UNIQUE NOT NULL,
  dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: propriedades

```sql
CREATE TABLE propriedades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomePropriedade VARCHAR(255) NOT NULL,
  enderecoCep VARCHAR(10),
  enderecoCidade VARCHAR(255),
  enderecoBairro VARCHAR(255),
  enderecoLogradouro VARCHAR(255),
  enderecoNumero VARCHAR(10),
  enderecoComplemento VARCHAR(255),
  enderecoPontoReferencia VARCHAR(255),
  tipo ENUM('Casa', 'Apartamento', 'Chacara', 'Lote', 'Outros') NOT NULL,
  valorEstimado DECIMAL(15, 2),
  documento VARCHAR(255),
  dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: usuarios\_propriedades

```sql
CREATE TABLE usuarios_propriedades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  idPropriedade INT NOT NULL,
  permissao ENUM('proprietario_master', 'usuario_comum') NOT NULL,
  dataVinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuarios(id),
  FOREIGN KEY (idPropriedade) REFERENCES propriedades(id),
  UNIQUE (idUsuario, idPropriedade)
);
```

### Tabela: fotos\_propriedade

```sql
CREATE TABLE fotos_propriedade (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idPropriedade INT,
  documento VARCHAR(255) NOT NULL,
  dataUpload DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idPropriedade) REFERENCES propriedades(id)
);
```

### Tabela: documentos\_propriedade

```sql
CREATE TABLE documentos_propriedade (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idPropriedade INT,
  tipoDocumento ENUM('IPTU', 'Matricula', 'Conta de Luz', 'Outros'),
  documento VARCHAR(255) NOT NULL,
  dataUpload DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idPropriedade) REFERENCES propriedades(id)
);
```

---

## 🗺️ Relacionamentos

* `usuarios` N\:N `propriedades` via `usuarios_propriedades`
* `propriedades` 1\:N `fotos_propriedade`
* `propriedades` 1\:N `documentos_propriedade`
