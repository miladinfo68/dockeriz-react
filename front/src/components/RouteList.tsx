import { Route, Routes } from "react-router-dom";
import Test from "./Test";
import TestChild2 from "./Test.Child2";
import TestChild1 from "./Test.Child1";
import HomePage from "./HomePage";
import NotFound from "./NotFound";

const RouteList = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="test" element={<Test />}>
          <Route path="1" element={<TestChild1 />}>
            <Route path="2" element={<TestChild2 />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  );
};

export default RouteList;
