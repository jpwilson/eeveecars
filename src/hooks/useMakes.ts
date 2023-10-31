import useData from "./useData";



export interface Make {
    name: string;
    ceo_pay?: number;
    headquarters?: string;
    founding_date?: string;
    market_cap?: number;
    revenue?: number;
    num_ev_model?: number;
    first_ev_model_date?: string;
    unionized?: boolean;
  }
  

const useMakes = () => useData<Make>('/makes');

export default useMakes;