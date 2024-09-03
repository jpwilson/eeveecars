import useData from "./useData";

export interface Person {
  id: string;
  name: string;
  age: number;
  location: string;
  university_degree: string;
  current_company: string;
  skills: string[];
  current_roles: { title: string; company: string }[];
  previous_roles: { title: string; company: string }[];
  strengths: {
    [key: string]: {
      score: number;
      description: string;
    };
  };
  weaknesses: {
    [key: string]: {
      score: number;
      description: string;
    };
  };
  car_companies_associated?: { name: string }[];
  founded_companies?: { name: string }[];
  companies_as_ceo?: { name: string }[];
}

const usePeople = () => {
  return useData<Person>('/people');
};

export default usePeople;