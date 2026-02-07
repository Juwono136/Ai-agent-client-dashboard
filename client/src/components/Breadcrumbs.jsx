import { Link, useLocation, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();

  // Handle special routes
  const getBreadcrumbPath = () => {
    const path = location.pathname;

    // Dashboard only
    if (path === "/dashboard") {
      return [{ label: "Home", path: null }];
    }

    // AI Agents routes
    if (path.startsWith("/ai-agents")) {
      const breadcrumbs = [
        { label: "Home", path: "/dashboard" },
        { label: "AI Agents", path: "/ai-agents" },
      ];

      // Create new agent
      if (path === "/ai-agents/create") {
        breadcrumbs.push({ label: "Create Agent", path: null });
        return breadcrumbs;
      }

      // Edit agent (has ID)
      if (params.id) {
        breadcrumbs.push({ label: "Edit Agent", path: null });
        return breadcrumbs;
      }

      return breadcrumbs;
    }

    // Connected Platforms
    if (path.startsWith("/platforms")) {
      return [
        { label: "Home", path: "/dashboard" },
        { label: "Connected Platforms", path: null },
      ];
    }

    // Users (admin only)
    if (path.startsWith("/users")) {
      return [
        { label: "Home", path: "/dashboard" },
        { label: "Users", path: null },
      ];
    }

    // Default: parse pathname
    const pathnames = path.split("/").filter((x) => x && x !== "dashboard");
    const breadcrumbs = [{ label: "Home", path: "/dashboard" }];

    pathnames.forEach((name, index) => {
      const routeTo = `/dashboard/${pathnames.slice(0, index + 1).join("/")}`;
      const isLast = index === pathnames.length - 1;
      const formattedName = name.replace(/-/g, " ");

      breadcrumbs.push({
        label: formattedName,
        path: isLast ? null : routeTo,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbPath();

  return (
    <div className="text-sm breadcrumbs text-gray-500 mb-1 hidden md:block">
      <ul>
        {breadcrumbs.map((crumb, index) => (
          <li key={index}>
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="flex items-center gap-2 hover:text-[#1C4D8D] transition-colors capitalize"
              >
                {index === 0 && <FaHome />}
                {crumb.label}
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-[#1C4D8D] font-semibold cursor-default capitalize">
                {index === 0 && <FaHome />}
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
