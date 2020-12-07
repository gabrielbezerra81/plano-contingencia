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
