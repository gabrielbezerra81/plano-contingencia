export interface UserAddress {
  id: string;
  cep: string;
  city: string;
  state: string;
  street: string;
  neighbor: string;
  number: string;
  complement: string;

  identification?: string;
  latitude?: number;
  longitude?: number;
  priority?: number;
}

// TODO: pendente de validação
export interface UserDocument {
  type: string;
  number: string;
  emitter: string;
}

export interface Phone {
  phone: string;
  type: "celular" | "fixo";
  obs: string;
  priority: number;
}

export interface Person {
  id: string;
  name: string;
  surname: string;
  role: string;
  phones: Array<Phone>;
  emails: Array<string>;
  birthDate: string;
  gender: "female" | "male";
  addresses: Array<UserAddress>;
  documents: Array<UserDocument>;
  status?: number;
}

export interface GroupPerson {
  id?: string;
  name: string;
  role: string;
  permission: "editor" | "visualizar" | "nenhuma";
  group?: boolean;
  personId: string;
  phone: string;
  status: number;
}

export interface Member extends GroupPerson {}

export interface Address {
  id?: string;
  cep: string;
  name: string;
  street: string;
  number?: string;
  complement: string;
  neighbor: string;
  city: string;
  state: string;
  refPoint: string;
  lat: string;
  long: string;
}

export interface RiskLocation extends Address {}

export interface Responsible extends GroupPerson {}

export type ResourceType =
  | "pessoa"
  | "veiculo"
  | "material"
  | "alimentacao"
  | "abrigo"
  | "dinheiro";

export interface Resource {
  id: string;
  address: Address;
  responsibles: Array<Responsible>;
  value1?: string;
  value2?: string;
  value3?: string;
  type: ResourceType;
}

export interface PlanData {
  generalDescription: {
    title: string;
    description: string;
  };
  workGroup: Array<Member>;
  riskLocations: Array<RiskLocation>;
  resources: Array<Resource>;
}
