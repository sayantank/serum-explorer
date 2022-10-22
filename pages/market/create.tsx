import { ReactNode } from "react";
import { getHeaderLayout } from "../../components/layouts/HeaderLayout";

const CreateMarket = () => {
  return <h1>create market</h1>;
};

CreateMarket.getLayout = (page: ReactNode) =>
  getHeaderLayout(page, "Create Market");

export default CreateMarket;
