import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <ul>
      <li>
          <Link to="/">خانه</Link>
        </li>
        <li>
          <Link to="/test"> صفحه تست</Link>
        </li>
        <li>
          <Link to="/test/1"> لینک اول</Link>
        </li>
        <li>
          <Link to="/test/1/2"> لینک دوم</Link>
        </li>
      </ul>
    </header>
  );
}
