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
  status: number;
}

export interface Member {
  id?: string;
  name: string;
  role: string;
  permission: "editor" | "visualizar" | "nenhuma";
  group?: boolean;
  personId: string;
  phone: string;
  status: number;
}

export interface RiskLocation {
  id: string;
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

export interface Resources {
  people: Array<ResourcePeople>;
  vehicles: Array<ResourceVehicle>;
  materials: Array<ResourceMaterials>;
  foods: Array<ResourceFood>;
  homes: Array<ResourceHome>;
  moneys: Array<ResourceMoney>;
}

export interface ResourcePeople {}

export interface ResourceVehicle {}

export interface ResourceMaterials {}

export interface ResourceFood {}

export interface ResourceHome {}

export interface ResourceMoney {}

export interface PlanData {
  generalDescription: {
    title: string;
    description: string;
  };
  workGroup: Array<Member>;
  riskLocations: Array<RiskLocation>;
}
