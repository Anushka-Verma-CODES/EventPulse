import type { User } from '../../../types/user';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body items-center text-center sm:flex-row sm:text-left gap-6">
        <div className="avatar">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={user.avatarUrl} alt={user.name} />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-base-content/60 text-sm">{user.email}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-base-content/70">
            <span>{user.branch}</span>
            <span>·</span>
            <span>Roll No. {user.rollNumber}</span>
            <span>·</span>
            <span>Joined {user.joinedDate}</span>
          </div>
        </div>

        <button className="btn btn-outline btn-sm">Edit profile</button>
      </div>
    </div>
  );
}