
import React from 'react';
import { recentActivities } from '../../../mocks/data';
import { ActivityStatus, RecentActivity } from '../../../types';

const StatusBadge: React.FC<{ status: ActivityStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full";
  let colorClasses = "";

  switch (status) {
    case ActivityStatus.Completed:
      colorClasses = "bg-success-lighter text-success-darker";
      break;
    case ActivityStatus.Pending:
      colorClasses = "bg-warning-lighter text-warning-darker";
      break;
    case ActivityStatus.Failed:
      colorClasses = "bg-error-lighter text-error-darker";
      break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


const RecentActivityTable: React.FC = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-custom-light h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 font-heading">Recent Activity</h3>
            <div className="flex-grow overflow-y-auto mt-4">
                <ul className="divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                        <li key={activity.id} className="py-3">
                            <div className="flex items-center space-x-4">
                                <img className="w-10 h-10 rounded-full" src={activity.user.avatarUrl} alt={activity.user.name} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                                    <p className="text-sm text-gray-500">{activity.user.name} - {activity.timestamp}</p>
                                </div>
                                <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                   <StatusBadge status={activity.status} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RecentActivityTable;
