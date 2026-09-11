import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="navbar min-h-0 h-14 bg-neutral/80 backdrop-blur-md border-b border-neutral-700/50 shadow-sm px-6 text-neutral-content">
        <div className="flex-1">
          <Link to="/events" className="btn btn-ghost btn-sm text-lg  text-white">
            EventPulse
          </Link>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            className="input input-sm w-24 md:w-auto bg-neutral-content/10 border-neutral-content/20 text-neutral-content placeholder:text-neutral-content/50"
          />

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm avatar">
              <div className="w-8 rounded-full">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSqbrT41MPsNfEh01aHFAAaG1HtMVGe57qOmBQQEiigGoZh4Q-PS_sN-ch&s=10" alt="Profile" />
              </div>
            </div>
            <ul
              tabIndex={-1}
              className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-1 mt-3 w-52 p-2 shadow border border-base-300"
            >
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}