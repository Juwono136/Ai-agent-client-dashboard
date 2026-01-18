import { Link, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Breadcrumbs = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x && x !== "dashboard");

  const isDashboardOnly = location.pathname === "/dashboard";

  return (
    <div className="text-sm breadcrumbs text-gray-500 mb-1 hidden md:block">
      <ul>
        {/* Home */}
        <li>
          {isDashboardOnly ? (
            <span className="flex items-center gap-2 text-[#1C4D8D] font-semibold cursor-default">
              <FaHome /> Home
            </span>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-[#1C4D8D]">
              <FaHome /> Home
            </Link>
          )}
        </li>

        {/* Other paths */}
        {!isDashboardOnly &&
          pathnames.map((name, index) => {
            const routeTo = `/dashboard/${pathnames.slice(0, index + 1).join("/")}`;

            const isLast = index === pathnames.length - 1;

            const formattedName = name.replace(/-/g, " ");

            return (
              <li key={name}>
                {isLast ? (
                  <span className="text-[#1C4D8D] font-semibold capitalize cursor-default">
                    {formattedName}
                  </span>
                ) : (
                  <Link to={routeTo} className="hover:text-[#1C4D8D] capitalize">
                    {formattedName}
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
