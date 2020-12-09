import { WritableDraft } from "immer/dist/internal";
import { Scenario } from "types/Plan";

export interface SuggestionList {
  id: string;
  cobrade: string;
  risco: string;
  medida: string;
}

export interface DuplicateScenariosLines {
  attr: keyof Scenario;
  value: any;
  draftScenariosList: WritableDraft<Scenario>[];
}

export interface FilterScenarioList {
  list: any[];
  attr: keyof Scenario;
  value: any;
}

export interface ScenarioDTO {
  disabledColumnsCheckbox: {
    address: boolean;
    threat: boolean;
    hypothese: boolean;
    risk: boolean;
    measure: boolean;
    responsible: boolean;
  };
  handleCheckItem: (attr: keyof Scenario, value: any) => void;
  verifyIfPreviousScenariosHasValue: (
    attr: keyof Scenario,
    value: any,
  ) => boolean;
}
