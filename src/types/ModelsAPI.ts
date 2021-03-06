export interface Telefone {
  ddd_numero: string;
  observacao: string;
  prioridade: number;
  tipo: string;
}

export interface Endereco {
  id?: string;
  cep: string;
  identificacao?: string;
  logradouro: string;
  numero?: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  latitude?: number;
  longitude?: number;
  referencia: string;
}

export interface Pessoa {
  id?: string;
  nome: string;
  sobrenome: string;
  trabalhoFuncao: string;
  telefones: Array<Telefone>;
  emails: Array<string>;
  nascimento?: string;
  sexo: string;
  enderecos: Array<Endereco>;
  atualizacao?: string;
  cadastro?: string;

  apelido?: string;
  cpf?: string;
  empresaDeTrabalho?: string;
  informacoes?: Array<{
    caracteristica: string;
    valor: string;
    valor2: string;
  }>;
  trabalhoFone?: string;
}

export interface Membro {
  id?: string;
  nome: string;
  funcao_atribuicao: string;
  permissao: string;
  aceite?: string;
  grupo?: boolean;
  pessoaId: string;
  telefone: string;
}

export interface LocalRisco extends Omit<Endereco, "id"> {
  id?: string;
}

interface Responsavel {
  aceite?: string;
  funcao_atribuicao: string;
  grupo?: boolean;
  id?: string;
  nome: string;
  permissao: string;
  pessoaId: string;
  telefone: string;
}

export interface Recurso {
  id: string;
  endereco?: Endereco;
  responsaveis: Array<Responsavel>;
  valor1?: string;
  valor2?: string;
  valor3?: string;
  tipo: string;
}

interface Risco {
  id: string;
  descricao: string;
}

interface Ameaca {
  cobrade: string;
  descricao: string;
}

interface Medida {
  id: string;
  descricao: string;
}

interface Cenario {
  id?: string;
  titulo: string;
  enderecoId: string;
  hipotese: string;
  medida: Medida;
  recursoId: string;
  responsaveis: Array<Responsavel>;
  risco: Risco;
  ameaca: Ameaca;
}

export interface Plano {
  id: string;
  titulo: string;
  descricao: string;
  cenarios: Array<Cenario>;
  locaisDeRisco: Array<LocalRisco>;
  membros: Array<Membro>;
  recursos: Array<Recurso>;
  tipo: string;
}
