import useData from "./useData";
import { Make } from "./useMakes";

export interface Car {
  id: number;
    make_name: string;
    model: string;
    submodel: string;
    generation: string;
    image_url: string;
    trim_first_released: string;
    carmodel_first_released: string;
    current_price: number;
    customer_and_critic_rating: number;
    average_rating: number;
    epa_range: number;
    acceleration_0_60: number; 
    top_speed: number; 
    make_model_slug: string;
    vehicle_class: string;
}

// Add an interface for SelectedFeature to detail the expected shape
export interface SelectedFeature {
    featureName: string;
    bucketName: string;
    carIds: number[];
  }

const useCars = (selectedMake?: Make | null, selectedFeature?: SelectedFeature | null, searchTerm?: string) => {
    const { data, error, isLoading } = useData<Car>('/cars/model-reps');

    let filteredCars = data;

    if (searchTerm) {
      filteredCars = filteredCars.filter(car => 
        car.make_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.submodel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (`${car.make_name} ${car.model}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (`${car.model} ${car.submodel}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (`${car.make_name} ${car.model} ${car.submodel}`).toLowerCase().includes(searchTerm.toLowerCase())
        // ... any other fields you want to search by
        // TODO - add ability to search for people and companies--- 26 Nov 2023
      );
    }

    //TODO add filtering by multiple features.... 17 Nov 2023


  if (selectedMake) {
    filteredCars = filteredCars.filter(car => selectedMake.car_id_list.includes(car.id));
  }

  // Further filter by feature if selected
  if (selectedFeature) {
    filteredCars = filteredCars.filter(car => selectedFeature.carIds.includes(car.id));
  }

  return { data: filteredCars, error, isLoading };
};

export default useCars;
