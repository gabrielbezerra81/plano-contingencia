export interface Telefone {
  ddd_numero: string;
  observacao: string;
  prioridade: number;
  tipo: string;
}

export interface EnderecoPessoa {
  id: string;
  cep: string;
  localidade: string;
  uf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  complemento: string;

  identificacao?: string;
  latitude?: number;
  longitude?: number;
  prioridade?: number;
}

export interface Pessoa {
  id: string;
  nome: string;
  trabalhoFuncao: string;
  telefones: Array<Telefone>;
  emails: Array<string>;
  nascimento: string;
  sexo: string;
  enderecos: Array<EnderecoPessoa>;
  atualizacao: string;
  cadastro: string;

  apelido?: string;
  cpf?: string;
  empresaDeTrabalho?: string;
  informacoes?: Array<{
    caracteristica: string;
    valor: string;
    valor2: string;
  }>;
  sobrenome?: string;
  trabalhoFone?: string;
}

export interface Membro {
  id: string;
  nome: string;
  funcao_atribuicao: string;
  permissao: string;
  aceite: string;
  grupo?: boolean;
  pessoaId: string;
  telefone: string;
}

export interface Endereco {
  id: string;
  cep: string;
  identificacao: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  latitude: number;
  longitude: number;
}

export interface LocalRisco extends Endereco {}

interface Responsavel {
  aceite: string;
  funcao_atribuicao: string;
  grupo: true;
  id: string;
  nome: string;
  permissao: string;
  pessoaId: string;
  telefone: string;
}

export interface Recurso {
  id: string;
  endereco: Endereco;
  responsaveis: Array<Responsavel>;
  valor1?: string;
  valor2?: string;
  valor3?: string;
}

export interface Plano {
  id: string;
  titulo: string;
  descricao: string;
  cenarios: Array<any>;
  locaisDeRisco: Array<LocalRisco>;
  membros: Array<Membro>;
  recursos: Array<Recurso>;
}
