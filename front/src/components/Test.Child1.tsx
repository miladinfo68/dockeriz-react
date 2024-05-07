import {  Outlet } from "react-router-dom"

const TestChild1 = () => {
  return (
    <>
    <div> xxxx First Component as a child of Test componenet <strong>Parent of Second component</strong></div>
    <Outlet/>
    </>
  )
}

export default TestChild1