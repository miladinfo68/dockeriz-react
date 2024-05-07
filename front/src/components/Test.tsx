import {  Outlet } from "react-router-dom";

const Test = () => {
  return (
    <>
      <h2>این یک صفحه آزمایشی جهت مسیریابی تو در توست</h2>
      <Outlet />
    </>
  );
};

export default Test;
