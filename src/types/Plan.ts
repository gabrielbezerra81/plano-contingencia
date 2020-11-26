export interface UserAddress {
  cep: string;
  city: string;
  state: string;
  street: string;
  neighbor: string;
  number: string;
  complement: string;
}

export interface UserDocument {
  type: string;
  number: string;
  emitter: string;
}
export interface User {
  id: number;
  name: string;
  role: string;
  permissions: "editor" | "visualizar" | "nenhuma";
  phones: Array<{
    phone: string;
    type: "cel" | "fixo";
    obs: string;
  }>;
  emails: string[];
  birthDate: string;
  gender: "female" | "male";
  addresses: Array<UserAddress>;
  documents: Array<UserDocument>;
  status: number;
}

export interface RiskLocation {
  name: string;
  address: string;
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
