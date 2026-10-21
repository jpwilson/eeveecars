import useData from "./useData";



export interface Make {
  id: number;
    name: string;
    ceo_pay?: number;
    headquarters?: string;
    founding_date?: string;
    market_cap?: number;
    revenue?: number;
    num_ev_model?: number;
    first_ev_model_date?: string;
    unionized?: boolean;
    lrg_logo_img_url: string;
    car_id_list: number[];
    status?: string;
    status_details?: string;
    description?: string;
    website_url?: string;
    country?: string;
  }
  

const useMakes = () => {
  const result = useData<Make>('/makes');
  
  // Filter out defunct brands that are no longer operating
  const DEFUNCT_BRANDS = ['Fisker', 'Canoo'];
  
  return {
    ...result,
    data: result.data.filter(make => !DEFUNCT_BRANDS.includes(make.name))
  };
};

export default useMakes;