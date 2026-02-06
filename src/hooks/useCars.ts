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

const useCars = (selectedMake?: Make | null, selectedFeatures?: SelectedFeature[] | null, searchTerm?: string) => {
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
      );
    }

  if (selectedMake) {
    filteredCars = filteredCars.filter(car => selectedMake.car_id_list.includes(car.id));
  }

  // Multi-feature filtering: union within same category, intersection across categories
  if (selectedFeatures && selectedFeatures.length > 0) {
    // Group by featureName
    const grouped = new Map<string, Set<number>>();
    for (const feat of selectedFeatures) {
      if (!grouped.has(feat.featureName)) {
        grouped.set(feat.featureName, new Set());
      }
      const set = grouped.get(feat.featureName)!;
      for (const id of feat.carIds) {
        set.add(id);
      }
    }
    // Intersect across categories
    filteredCars = filteredCars.filter(car => {
      for (const carIdSet of grouped.values()) {
        if (!carIdSet.has(car.id)) return false;
      }
      return true;
    });
  }

  return { data: filteredCars, error, isLoading };
};

export default useCars;
