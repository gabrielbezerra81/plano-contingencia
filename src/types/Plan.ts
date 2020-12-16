export interface Address {
  id?: string;
  cep: string;
  identification?: string;
  street: string;
  number?: string;
  complement: string;
  neighbor: string;
  city: string;
  state: string;
  refPoint: string;
  lat?: string;
  long?: string;
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
  addresses: Array<Address>;
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
  address?: Address;
  responsibles: Array<Responsible>;
  value1?: string;
  value2?: string;
  value3?: string;
  type: ResourceType;
}

export interface Risk {
  id: string;
  description: string;
  mergeKey: number;
}

export interface Threat {
  cobrade: string;
  description: string;
  mergeKey: number;
}

export interface Measure {
  id: string;
  description: string;
  mergeKey: number;
}

export interface Hypothese {
  hypothese: string;
  mergeKey: number;
}

export interface ScenarioResource {
  resourceId: string;
  mergeKey: number;
}

export interface Scenario {
  id?: string;
  title: string;
  addressId: string;
  hypothese: Hypothese;
  measure: Measure;
  resourceId: ScenarioResource;
  responsibles: Array<Responsible>;
  risk: Risk;
  threat: Threat;
  responsiblesMergeKey?: number;
}

export interface PlanData {
  generalDescription: {
    title: string;
    description: string;
  };
  workGroup: Array<Member>;
  riskLocations: Array<RiskLocation>;
  resources: Array<Resource>;
  scenarios: Array<Scenario>;
}
