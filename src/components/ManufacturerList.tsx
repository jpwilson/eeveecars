import useMakes from "../hooks/useMakes";

const ManufacturerList = () => {
  const { data } = useMakes();
  return (
    <ul>
      {data.map((make) => (
        <li key={make.id}>{make.name}</li>
      ))}
    </ul>
  );
};

export default ManufacturerList;
